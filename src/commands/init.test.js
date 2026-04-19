const { handler } = require('./init');
const templates = require('../templates');
const scaffold = require('../scaffold');

jest.mock('../templates');
jest.mock('../scaffold');
jest.mock('inquirer');

const inquirer = require('inquirer');

describe('init command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it('exits if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ template: 'ghost', dest: '.', yes: true })).rejects.toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('scaffolds without prompt when --yes is passed', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'react-app', description: 'A React app' });
    templates.getTemplatePath.mockReturnValue('/templates/react-app');
    scaffold.scaffold = jest.fn().mockResolvedValue();
    require('../scaffold').scaffold = scaffold.scaffold;

    await handler({ template: 'react-app', dest: '.', yes: true });
    expect(scaffold.scaffold).toHaveBeenCalled();
  });

  it('aborts if user declines confirmation', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'react-app' });
    templates.getTemplatePath.mockReturnValue('/templates/react-app');
    inquirer.prompt = jest.fn().mockResolvedValue({ confirm: false });

    await handler({ template: 'react-app', dest: '.', yes: false });
    expect(console.log).toHaveBeenCalledWith('Aborted.');
  });

  it('proceeds if user confirms', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'react-app' });
    templates.getTemplatePath.mockReturnValue('/templates/react-app');
    inquirer.prompt = jest.fn().mockResolvedValue({ confirm: true });
    const { scaffold: scaffoldFn } = require('../scaffold');
    scaffoldFn.mockResolvedValue();

    await handler({ template: 'react-app', dest: 'myproject', yes: false });
    expect(scaffoldFn).toHaveBeenCalled();
  });
});
