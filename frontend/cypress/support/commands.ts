// mrmnew/frontend/cypress/support/commands.ts

import { jwtDecode } from 'jwt-decode';

Cypress.Commands.add('login', (username, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/auth/login', // A backend API login végpontja
    body: {
      username: username,
      password: password,
    },
  }).then((response) => {
    const token = response.body.access_token;
    
    // 1. LÉPÉS: Mentsük a tokent
    window.localStorage.setItem('access_token', token);

    // 2. LÉPÉS: Dekódoljuk a tokent, hogy kinyerjük a felhasználói adatokat
    const decodedPayload: { sub: number; username: string; role: string } = jwtDecode(token);

    // 3. LÉPÉS: Hozzuk létre a user objektumot, amit az AuthContext vár
    const userToStore = {
      id: decodedPayload.sub,
      username: decodedPayload.username,
      role: decodedPayload.role,
    };

    // 4. LÉPÉS: Mentsük el a user objektumot is a localStorage-ba
    window.localStorage.setItem('user', JSON.stringify(userToStore));
  });
});

// Típusdefiníció (ezen nem kell változtatni)
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
    }
  }
}