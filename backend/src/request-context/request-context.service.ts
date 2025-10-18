// mrmnew/backend/src/request-context/request-context.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { User } from 'src/users/user.entity';

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<{ user: User | null }>();

  // JAVÍTVA: A 'run' már nem vár user paramétert
  run(callback: () => any) {
    this.als.run({ user: null }, callback); // Mindig null-lal indít
  }

  getUser(): User | null {
    const store = this.als.getStore();
    return store?.user || null;
  }

  // --- ÚJ METÓDUS ---
  // Ezt fogja hívni a Guard, miután beazonosította a felhasználót
  setUser(user: User) {
    const store = this.als.getStore();
    if (store) {
      store.user = user;
    }
  }
}