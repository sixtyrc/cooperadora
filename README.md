<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="60" alt="React" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Django.svg" width="60" alt="Django" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="60" alt="PostgreSQL" />
  
  <br/>
  <h1>🎒 Cooperadora Online</h1>
  <p><b>La solución moderna para centralizar campañas, pedidos y entregas en jardines de infantes y cooperadoras escolares.</b></p>
</div>

<p align="center">
  <a href="#el-problema">El Problema</a> •
  <a href="#la-solución">La Solución</a> •
  <a href="#características-principales">Características</a> •
  <a href="#stack-tecnológico">Stack Tecnológico</a> •
  <a href="#estado-del-proyecto">Estado del Proyecto</a>
</p>

---

## 🛑 El Problema

Históricamente, las cooperadoras escolares y jardines de infantes han dependido de WhatsApp o cuadernos de comunicaciones para gestionar la venta de uniformes, ajuares, delantales y eventos especiales. Esto genera:
- **Desorganización:** Pedidos perdidos en chats interminables.
- **Pagos confusos:** Comprobantes de transferencia mezclados y difíciles de conciliar.
- **Fricción en las entregas:** Dificultad para saber quién pagó, quién retiró y qué falta por entregar.

## 💡 La Solución

**Cooperadora Online** es una aplicación web diseñada específicamente para resolver esta fricción. Proporciona una interfaz amigable (inspirada en Canva y Duolingo) tanto para los padres que realizan los pedidos, como para las cooperadoras que administran la logística.

El sistema se aleja de los complejos y aburridos ERP tradicionales para enfocarse en un flujo 100% Mobile-First, intuitivo y eficiente.

---

## ✨ Características Principales

- 🏢 **Identidad Personalizable:** Colores, logo y mensaje de bienvenida configurables por cada institución.
- 🛍️ **Gestión de Campañas:** Creación de campañas temporales (ej. "Invierno 2026") con productos específicos a la venta.
- 🛒 **Pedidos Centralizados:** Flujo de compra sencillo donde un padre registra al alumno, elige productos y el sistema calcula totales.
- 🧾 **Verificación de Pagos:** Subida de comprobantes de transferencia (o aviso de pago en efectivo) integrados directamente en el pedido.
- 📦 **Logística de Entregas:** Control estricto de qué pedido ya fue entregado y por qué operador.
- 📊 **Panel Administrativo:** Backoffice completo para gestionar el ciclo de vida de campañas, validar pagos y obtener reportes.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo una arquitectura robusta, pero mantenible, priorizando tecnologías estables y de largo plazo.

### Backend 🐍
* **Python 3.13**
* **Django 6** + **Django REST Framework**
* Autenticación segura mediante **Session Cookies** (`HttpOnly`, `SameSite=Lax`). Sin JWT.
* **PostgreSQL** como motor de base de datos relacional.

### Frontend ⚛️
* **React 19**
* **TypeScript**
* **Vite**
* **TailwindCSS v4**

### Despliegue (Producción) 🚀
* **Windows Server**
* **NSSM** (para servicios en segundo plano)
* **Waitress** (servidor WSGI)
* **Caddy** (Proxy Inverso y HTTPS automático)

---

## 🚀 Estado del Proyecto

El proyecto se está desarrollando de manera iterativa por fases. Actualmente el backend se encuentra sólidamente estructurado y se está avanzando hacia el panel administrativo y frontend público.

| Fase | Tarea | Estado |
| :---: | :--- | :---: |
| 1 | Arquitectura y Setup base | ✅ Completada |
| 2 | Seguridad y Autenticación | ✅ Completada |
| 3 | Configuración Institucional | ✅ Completada |
| 4 | Gestión de Campañas | ✅ Completada |
| 5 | Gestión de Productos | ✅ Completada |
| 6 | Toma de Pedidos | ✅ Completada |
| 7 | Sistema de Pagos y Comprobantes | ✅ Completada |
| 8 | Control de Entregas | ✅ Completada |
| 9 | Reportes y Dashboard | ✅ Completada |
| 10 | Frontend Público (React) | ✅ Completada |
| 11 | Backoffice Administrativo (React) | ✅ Completada |
| 12 | Despliegue a Producción | ✅ Configurado; pendiente validar en servidor |

---

<div align="center">
  <sub>Desarrollado con ❤️ para facilitar el trabajo de las cooperadoras escolares.</sub>
</div>
