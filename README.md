# 🔧 Los Clavitos de Pablito - Sistema de Gestión eCommerces

## 📘 Introducción

Este proyecto nace como respuesta al caso propuesto por la asignatura **ASY5131 - Integración de Plataformas**, cuyo objetivo es aplicar conocimientos de análisis, planificación e integración de servicios en un contexto real de transformación digital. El caso se centra en **LOS CLAVITOS DE PABLITO**, una empresa chilena del rubro de ferretería y construcción, con presencia física en diversas regiones del país.

## 🧩 El problema

A raíz de la pandemia del COVID-19 y las restricciones de movilidad, LOS CLAVITOS DE PABLITO enfrentó una caída significativa en sus ventas debido a la falta de un canal de venta online. La empresa operaba exclusivamente de forma presencial, lo que evidenció una necesidad urgente de modernizar sus procesos mediante la implementación de una **Plataforma de Comercio Electrónico Integrada**.

## ✅ La solución

Se propone el desarrollo de un sistema de eCommerce para la Ferretería **"Los Clavitos de Pablito"**, que responde a la necesidad de digitalizar los procesos operacionales de esta. La solución considera:

- Implementación de un **Sistema Web** desarrollado en **Angular + Ionic**.
- Integración de múltiples roles de usuarios: Clientes, Administradores, Vendedores, Bodegueros y Contadores.
- Automatización de procesos de compra, gestión de inventario, pagos y despachos.
- Diseño de flujos de negocio a través de diagramas BPMN.
- Arquitectura basada en microservicios con APIs propias y externas.

## 🔌 Tecnologías y APIs utilizadas

### 🖥️ Frontend
- Angular 19
- Ionic Framework

### 🖥️ Backend
- Node.js

### 🧠 APIs Internas
- **API de usuarios**: desarrollada con **Express.js**.
- **API de productos**: implementada con **FastAPI (Python)**.

### 🌐 APIs Externas
- **API de PayPal**: integración para pagos seguros en línea.
- **API de MiIndicador.cl**: para consulta del valor actualizado del dólar y conversión automática de precios.

## 🔐 Funcionalidades principales por rol

| Rol          | Funcionalidades clave |
|--------------|------------------------|
| **Cliente**       | Registro, navegación de catálogo, carrito de compras, elección de retiro o despacho, múltiples medios de pago. |
| **Vendedor**      | Gestión de pedidos, aprobación y envío de órdenes a bodega, coordinación de despachos. |
| **Bodeguero**     | Preparación de pedidos, entrega a vendedores. |
| **Contador**      | Verificación de pagos, registro de entregas. |
| **Administrador** | Gestión de cuentas de usuarios, informes de desempeño y estrategias de venta. |

## 🗂️ Arquitectura general

El sistema está compuesto por una arquitectura modular y escalable:
- Frontend para distribución web.
- Dos APIs desarrolladas de forma desacoplada.
- Integración de servicios externos REST.
- Comunicación entre servicios vía HTTP (RESTful).

## 📥 Instalación y ejecución del proyecto

### 🔁 1. Clonar el repositorio

```bash
git clone https://github.com/Geraldine202/Ferreteria.git
cd Ferreteria/
```
---

### ⚙️ 2. Instalación de dependencias del frontend (Angular + Ionic)

```bash
npm install
```
---

### 🖥️ 3. Apertura del Sitio Web

```bash
ionic serve
```