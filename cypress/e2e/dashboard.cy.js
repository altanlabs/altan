describe('Platform tests', () => {
  beforeEach(() => {
    cy.login('demo@altan-ai', 'L0v3HADES');
  });

  it('Dashboard', () => {
    cy.visit('/dashboard'); 
    cy.contains('.MuiTypography-root.MuiTypography-h4.MuiTypography-paragraph', 'Welcome back', { timeout: 15000 }).should('exist');
  });
  
  it('Knowledge', () => {
    cy.visit('/knowledge');
    cy.contains('h4.MuiTypography-root.MuiTypography-h4', 'Knowledge Base', { timeout: 15000 }).should('exist');
  });

  it('Spaces', () => {
    cy.visit('/spaces'); 
    cy.contains('MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButton-disableElevation MuiButton-root MuiButton-text MuiButton-textInherit MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorInherit MuiButton-disableElevation css-8uguk8', { timeout: 15000 }).should('exist');

  });

});

  
  
  