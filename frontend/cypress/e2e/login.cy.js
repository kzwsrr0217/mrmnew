// mrmnew/frontend/cypress/e2e/login.cy.ts

describe('Bejelentkezési Folyamat', () => {

  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.visit('http://localhost:5173/login');
    cy.contains('h1', 'MRM Bejelentkezés').should('be.visible');
  });

  it('Sikeres bejelentkezés admin felhasználóval', () => {
    cy.get('input[placeholder="Felhasználónév"]').type('admin');
    cy.get('input[placeholder="Jelszó"]').type('password');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/systems');
    
    cy.contains('h1', 'Rendszerek Nyilvántartása').should('be.visible');
  });

  it('Sikertelen bejelentkezés rossz jelszóval', () => {
    cy.get('input[placeholder="Felhasználónév"]').type('admin');
    cy.get('input[placeholder="Jelszó"]').type('rosszjelszo');
    cy.get('button[type="submit"]').click();

    cy.url().should('not.include', '/systems');
    cy.url().should('include', '/login');
    
    cy.contains('Hibás felhasználónév vagy jelszó!').should('be.visible');
  });

});