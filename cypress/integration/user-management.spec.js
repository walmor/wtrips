/// <reference types="Cypress" />

const USERS_ENDPOINT = /users\/.*$/;

function clickOnUsersMenu() {
  cy.get('.UsersMenuItem')
    .should('be.visible')
    .click();
}

function clickOnFirstUser() {
  cy.get('table .LinkButton')
    .first()
    .click();
}

function fillOutTheUserFormAndSubmit(name, email) {
  cy.get('#name')
    .clear()
    .type(name)
    .should('have.value', name);

  cy.get('#email')
    .clear()
    .type(email)
    .should('have.value', email);

  cy.server();
  cy.route('PUT', USERS_ENDPOINT).as('update');

  cy.get('.ant-modal-footer .ant-btn-primary').click();

  cy.wait('@update')
    .its('status')
    .should('eq', 200);
}

context('User management', () => {
  specify('A regular user cannot see the users menu', () => {
    cy.signIn('user');

    cy.get('.UsersMenuItem').should('not.exist');
  });

  specify('An user can edit his profile', () => {
    const newName = 'EditedUser';
    const newEmail = 'edituser1@example.com';

    cy.signIn('user');

    cy.get('.UserDropdown').trigger('mouseover');
    cy.get('.MyProfileMenuItem').click();

    fillOutTheUserFormAndSubmit(newName, newEmail);

    cy.get('.UserName').should('contain', newName);
  });

  specify('An admin user can edit an user profile', () => {
    const newName = 'EditedUser';
    const newEmail = 'edituser2@example.com';

    cy.signIn('admin');

    clickOnUsersMenu();

    clickOnFirstUser();

    fillOutTheUserFormAndSubmit(newName, newEmail);

    cy.get('table .LinkButton')
      .first()
      .should('contain', newName);

    cy.get('table tbody tr')
      .first('td:nth-child(2)')
      .should('contain', newEmail);
  });

  specify('A manager user cannot set an user as admin', () => {
    cy.signIn('manager');

    clickOnUsersMenu();

    // Should not see any Admin user on the list
    cy.get('table tbody tr')
      .contains('Admin')
      .should('not.exist');

    clickOnFirstUser();

    // Should not be able to select the Admin role
    cy.get('.UserRolesSelect').click();
    cy.get('.RoleSelectOption-admin').should('not.exist');

    cy.get('.ant-modal-close-x').click();
  });
});
