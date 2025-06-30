describe('Direct API Testing login...', () => {
    it('Dashboard loads correctly', () => {
      // Construct payload and headers
      const payload = {
        username: 'demo@altan-ai',
        password: 'L0v3HADES'
      };
      
      // Define origin and dev values
      const origin = encodeURIComponent('http://localhost:5173');
      const dev = '345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi';
  
      // Make a direct API call for authentication
      cy.request({
        method: 'POST',
        url: `https://api.altan.ai/platform/auth/token?origin=${origin}&dev=${dev}`,
        body: payload
      }).then((response) => {
        expect(response.status).to.eq(200);  // Expecting a 200 OK status
        cy.log('Login API response:', JSON.stringify(response.body));
  
        // Visit the dashboard
        cy.visit(response.body.redirect);
  
    });
  });
});
  