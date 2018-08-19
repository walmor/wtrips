/// <reference types="Cypress" />

const TRIPS_ENDPOINT = /trips\/.*$/;

function fillOutTripFormAndSubmit(method, alias, destination) {
  cy.get('#destination')
    .clear()
    .type(destination);

  cy.get('.TripRangePicker').click();

  cy.get('.ant-calendar-today').click();
  cy.get('.ant-calendar-today')
    .parent()
    .next('tr')
    .children('td')
    .first()
    .click();

  cy.get('#comment')
    .clear()
    .type('Trip created by an automated test.');

  cy.server();
  cy.route(method, TRIPS_ENDPOINT).as(alias);

  cy.get('.ant-modal-footer .ant-btn-primary').click();

  cy.wait(`@${alias}`)
    .its('status')
    .should('eq', method === 'POST' ? 201 : 200);
}

function clickOnFirstTrip() {
  cy.get('table .LinkButton')
    .first()
    .click();
}

function tripListItemShouldBeUpdated(alias, destination) {
  cy.get(`@${alias}`).then(xhr => {
    const { _id } = xhr.responseBody;
    cy.get(`table tr[data-row-key=${_id}]`)
      .find('td .LinkButton')
      .should('contain', destination);
  });
}

context('Trip management', () => {
  beforeEach(() => {
    cy.signIn('user');
  });

  specify('An user can create a trip', () => {
    cy.get('.CreateTripButton').click();

    const destination = 'Automation Island';

    fillOutTripFormAndSubmit('POST', 'create', destination);

    tripListItemShouldBeUpdated('create', destination);
  });

  specify('An user can update a trip', () => {
    const destination = 'Robot Island';

    clickOnFirstTrip();

    fillOutTripFormAndSubmit('PUT', 'update', destination);

    tripListItemShouldBeUpdated('update', destination);
  });

  specify('An user can delete a trip', () => {
    cy.get('.DeleteTripActionButton')
      .first()
      .click();

    cy.server();
    cy.route('DELETE', TRIPS_ENDPOINT).as('delete');

    cy.get('.ant-popover .ant-btn-primary').click();

    cy.wait('@delete')
      .its('status')
      .should('eq', 200);

    cy.get('@delete').then(xhr => {
      const { tripId } = xhr.responseBody;
      cy.get(`table tr[data-row-key=${tripId}]`).should('not.exist');
    });
  });

  specify('An user can print a travel plan', () => {
    cy.get('.TravelPlanMenuItem').click();

    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });
});
