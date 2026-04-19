const fs = require('fs');
const path = require('path');
const os = require('os');
const { listTemplates, loadTemplateMeta, templateExists, getTemplatePath } = require('./templates');

// Point TEMPLATES_DIR to a temp directory for testing
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

beforeAll(() => {
  // Create a fake templates directory with two templates
  fs.mkdirSync(path.join(TEMPLATES_DIR, 'node-basic'), { recursive: true });
  fs.mkdirSync(path.join(TEMPLATES_DIR, 'react-app'), { recursive: true });

  fs.writeFileSync(
    path.join(TEMPLATES_DIR, 'node-basic', 'template.json'),
    JSON.stringify({ name: 'node-basic', description: 'A basic Node.js project', version: '1.0.0' })
  );
  // react-app intentionally has no template.json
});

afterAll(() => {
  fs.rmSync(TEMPLATES_DIR, { recursive: true, force: true });
});

describe('listTemplates', () => {
  test('returns array of template directory names', () => {
    const templates = listTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates).toContain('node-basic');
    expect(templates).toContain('react-app');
  });

  test('returns empty array when templates dir does not exist', () => {
    const original = fs.existsSync;
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    expect(listTemplates()).toEqual([]);
    fs.existsSync.mockRestore();
  });
});

describe('loadTemplateMeta', () => {
  test('loads and parses template.json correctly', () => {
    const meta = loadTemplateMeta('node-basic');
    expect(meta.name).toBe('node-basic');
    expect(meta.description).toBe('A basic Node.js project');
  });

  test('returns empty object when template.json is missing', () => {
    const meta = loadTemplateMeta('react-app');
    expect(meta).toEqual({});
  });
});

describe('templateExists', () => {
  test('returns true for existing template', () => {
    expect(templateExists('node-basic')).toBe(true);
  });

  test('returns false for non-existent template', () => {
    expect(templateExists('does-not-exist')).toBe(false);
  });
});

describe('getTemplatePath', () => {
  test('returns correct absolute path', () => {
    const p = getTemplatePath('node-basic');
    expect(p).toBe(path.join(__dirname, '..', 'templates', 'node-basic'));
  });
});
