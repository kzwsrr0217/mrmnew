// mrmnew/frontend/cypress/e2e/tickets.cy.ts

describe('Ticket Management', () => {
  beforeEach(() => {
    // Bejelentkezés és a felugró ablak bezárása
    cy.login('admin', 'password');
    cy.visit('/tickets');
    cy.get('.modal > button').click();
  });

  it('Létre kell hozzon egy ticketet, és ellenőrzi szerepel-e a listában', () => {
    const ticketTitle = `Cypress teszt ticket - ${Date.now()}`;
    const ticketDescription = 'Ez a hibajegy leírása, amelyet a Cypress E2E teszt hozott létre.';


    cy.contains('Új feladat').click();

    cy.get('form > input').type(ticketTitle);
    
    cy.get('textarea').type(ticketDescription);
    
    cy.get(':nth-child(4) > select').select('Magas');
    
    cy.get(':nth-child(5) > select').select('bv');
    
    cy.get('button[type="submit"]').click();
    
    cy.get('.card-grid').should('contain', ticketTitle);
  });
});