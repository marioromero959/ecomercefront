import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone:true,
  imports: [MatIcon, MatButton, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>E-Commerce</h3>
          <p>Tu tienda online de confianza</p>
        </div>
        
        <div class="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a routerLink="/">Inicio</a></li>
            <li><a routerLink="/products">Productos</a></li>
            <li><a routerLink="/login">Iniciar Sesión</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>Email: info@ecommerce.com</p>
          <p>Teléfono: +1 234 567 890</p>
        </div>
        
        <div class="footer-section">
          <h4>Síguenos</h4>
          <div class="social-links">
            <button mat-icon-button>
              <mat-icon>facebook</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>instagram</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>twitter</mat-icon>
            </button>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 E-Commerce. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #2c3e50;
      color: white;
      margin-top: auto;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .footer-section h3,
    .footer-section h4 {
      margin-bottom: 15px;
      color: #ecf0f1;
    }
    
    .footer-section ul {
      list-style: none;
      padding: 0;
    }
    
    .footer-section ul li {
      margin-bottom: 8px;
    }
    
    .footer-section a {
      color: #bdc3c7;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .footer-section a:hover {
      color: #ecf0f1;
    }
    
    .social-links {
      display: flex;
      gap: 10px;
    }
    
    .footer-bottom {
      background-color: #1a252f;
      text-align: center;
      padding: 20px;
      border-top: 1px solid #34495e;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
