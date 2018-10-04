// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('seedDatabase', () => {
  cy.request('POST', '/api/tests/seed-db');
});

Cypress.Commands.add('signIn', role => {
  const email = `${role}@example.com`;
  const pwd = '123456';

  cy.visit('/');

  cy.get('#signinEmail').type(email);

  cy.get('#signinPassword')
    .type(pwd)
    .type('{enter}');

  cy.get('.SiderTrigger').click();
});

Cypress.Commands.add('signOut', role => {
  cy.get('.UserDropdown').trigger('mouseover');
  cy.get('.SignOutMenuItem').click();
});

//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
