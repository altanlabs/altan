describe('Testing login...', () => {
    it('Dashboard loads correctly', () => {
      // Intercept the API request and give it an alias
      cy.intercept('POST', 'https://api.altan.ai/platform/auth/token').as('getToken');
      
      cy.visit('/auth/login');
      
      cy.get('input[name=email]').should('not.be.disabled').type('demo@altan-ai');
      cy.get('input[name=password]').should('not.be.disabled').type('L0v3HADES');
      
      
      cy.get('button[type=submit]').click();
    
      
      cy.wait('@getToken', { timeout: 10000 }).then((interception) => {
        cy.log('Interception:', JSON.stringify(interception));
      });
      
      cy.url().should('include', '/platform/dashboard');
      
    });
  });
  