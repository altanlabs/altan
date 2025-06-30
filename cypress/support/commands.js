Cypress.Commands.add('login', (username, password) => {
    // Define origin and dev values
    const origin = encodeURIComponent('http://localhost:5173');
    const dev = '345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi';
  
    // Construct payload
    const payload = {
      username: username,
      password: password
    };
  
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
  

Cypress.on('uncaught:exception', (err, runnable) => {
    console.error(err.stack);  // Print the error stack trace
    return false;  // Return false to prevent Cypress from failing the test
});
  
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })