describe('Testin landing page...', () => {
    it('Home Screen', () => {
      cy.visit('/') 
    })
    it('Not authenticated', () => {
      cy.visit('/platform/dashboard') 
      cy.contains('.MuiTypography-root.MuiTypography-h4.MuiTypography-paragraph', 'Welcome back', { timeout: 15000 }).should('not.exist');
    })
    it('Pricing', () => {
      cy.visit('/pricing') 
    })
    it('Terms', () => {
      cy.visit('/terms') 
    })
    it('Privacy', () => {
      cy.visit('/privacy') 
    })
    it('About us', () => {
      cy.visit('/about-us') 
    }) 
    it('FAQs', () => {
      cy.visit('/faqs') 
    })
  })