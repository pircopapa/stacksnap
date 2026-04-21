const { getAnnotations, setAnnotation, clearAnnotation, getAnnotation, searchAnnotations } = require('./annotations');

jest.mock('./config');
jest.mock('./templates');

const { loadConfig, saveConfig } = require('./config');
const { listTemplates } = require('./templates');

describe('annotations', () => {
  let mockConfig;

  beforeEach(() => {
    mockConfig = { annotations: { 'react-app': 'My React starter', 'node-api': 'REST API base' } };
    loadConfig.mockReturnValue(mockConfig);
    saveConfig.mockImplementation((c) => { Object.assign(mockConfig, c); });
    listTemplates.mockReturnValue(['react-app', 'node-api', 'vue-app']);
  });

  test('getAnnotations returns all annotations', () => {
    const result = getAnnotations();
    expect(result).toEqual({ 'react-app': 'My React starter', 'node-api': 'REST API base' });
  });

  test('getAnnotation returns note for a template', () => {
    const note = getAnnotation('react-app');
    expect(note).toBe('My React starter');
  });

  test('getAnnotation returns null when not set', () => {
    const note = getAnnotation('vue-app');
    expect(note).toBeNull();
  });

  test('setAnnotation saves a new annotation', () => {
    setAnnotation('vue-app', 'Vue starter kit');
    expect(saveConfig).toHaveBeenCalled();
    expect(mockConfig.annotations['vue-app']).toBe('Vue starter kit');
  });

  test('clearAnnotation removes an annotation', () => {
    clearAnnotation('react-app');
    expect(saveConfig).toHaveBeenCalled();
    expect(mockConfig.annotations['react-app']).toBeUndefined();
  });

  test('searchAnnotations filters by keyword in name', () => {
    const results = searchAnnotations('react');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('react-app');
  });

  test('searchAnnotations filters by keyword in note', () => {
    const results = searchAnnotations('REST');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('node-api');
  });

  test('searchAnnotations excludes templates not in list', () => {
    mockConfig.annotations['ghost-template'] = 'orphaned note';
    const results = searchAnnotations('orphaned');
    expect(results).toHaveLength(0);
  });
});
