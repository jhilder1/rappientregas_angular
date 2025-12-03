import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const customer = localStorage.getItem('customer');
  
  if (customer) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};


