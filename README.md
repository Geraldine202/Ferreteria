# 🔧 Los Clavitos de Pablito - Sitio Web de Compras

## 📘 Introducción

Este proyecto nace como respuesta al caso propuesto por la asignatura **ASY5131 - Integración de Plataformas**, cuyo objetivo es aplicar conocimientos de análisis, planificación e integración de servicios en un contexto real de transformación digital. El caso se centra en **LOS CLAVITOS DE PABLITO**, una empresa chilena del rubro de ferretería y construcción, con presencia física en diversas regiones del país.

## 🧩 El problema

A raíz de la pandemia del COVID-19 y las restricciones de movilidad, LOS CLAVITOS DE PABLITO enfrentó una caída significativa en sus ventas debido a la falta de un canal de venta online. La empresa operaba exclusivamente de forma presencial, lo que evidenció una necesidad urgente de modernizar sus procesos mediante la implementación de un **Sitio Web**.

## ✅ La solución

Se propone el desarrollo de un sistema web para la Ferretería **"Los Clavitos de Pablito"**, que responde a la necesidad de digitalizar los procesos operacionales de esta. La solución considera:

- Implementación de un **Sitio Web** desarrollado en **Angular + Ionic**.
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

Esto abrirá automáticamente la aplicación en [http://localhost:8100](http://localhost:8100).

---

### 🌐 4. Levantar API de Express (Node.js)

```bash
cd ../api-express
npm install
node index.js
```

- Asegúrate de tener instalado **Node.js**.
- El servidor se levantará en [http://localhost:3000](http://localhost:3000) (o el puerto definido en tu archivo de configuración).

---

### 🐍 5. Levantar API de FastAPI (Python)

```bash
cd ../api-fastapi
pip install -r requirements.txt
uvicorn main:app --reload
```

- Asegúrate de tener **Python 3.8+** y `pip` instalado.
- Por defecto, la API estará disponible en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger UI).

Si usas entornos virtuales en Python:

```bash
python -m venv venv
source venv/bin/activate  # En Linux/Mac
venv\Scripts\activate   # En Windows
`venv\Script\activate`   # Tambien Tienes esta Opción que funciona de la misma forma para Windows    
```

---

## 🗃️ Configuración de la Base de Datos (Oracle SQL Developer)

Para levantar la base de datos utilizada por el sistema, sigue estos pasos en **Oracle SQL Developer**:

### 🔑 1. Crear usuario de base de datos

Ejecuta las siguientes instrucciones con un usuario con privilegios de DBA (por ejemplo, `SYS AS SYSDBA`):

```sql
ALTER SESSION SET "_oracle_script" = TRUE;

CREATE USER bd_clavitos IDENTIFIED BY bd_clavitos;

GRANT ALL PRIVILEGES TO bd_clavitos;
```

> Esto crea el usuario `bd_clavitos` con todos los permisos necesarios.

---

### 📂 2. Cargar el script con los datos iniciales

1. Descarga el archivo SQL desde el siguiente enlace:  
   📥 [Descargar BD Actualizada Validada.docx](https://docs.google.com/document/d/1PNXwfGHzRZ73OzGCgYb0aNT1u_F7BjyX/edit?usp=sharing&ouid=115950102634333539993&rtpof=true&sd=true)
2. Abre Oracle SQL Developer y conéctate con el usuario `bd_clavitos`.
3. Crea un nuevo archivo `.sql`, pega el contenido del documento y ejecútalo con.

> El script incluye los registros para poblar las tablas de: regiones, comunas, usuarios, roles, productos, marcas, categorías, inventario, pedidos, pagos y reportes.

---

## 📈 Conclusión

**"Los Clavitos de Pablito"** representa una solución completa de transformación digital para una empresa Ferretera. El proyecto no solo mejora la experiencia del cliente, sino que también optimiza los procesos internos, incrementa la eficiencia operativa y abre nuevas oportunidades de expansión comercial. La integración de tecnologías modernas y APIs externas proporciona una base sólida para el crecimiento futuro del negocio.

---

**Desarrollado como parte de la evaluación académica del módulo ASY5131 - Integración de Plataformas.**

---

## 👨‍💻 Desarrollado por

Este proyecto fue creado por el equipo de desarrollo, conformado por:

- 👩‍💻 Daphne Cuadra  
- 👩‍💻 Geraldine Inostroza  
- 👨‍💻 Cristóbal Rivero  

---

<p align="center">
  <b>Los Clavitos de Pablito</b> © 2025<br>
  <i>"Transformando la ferretería tradicional en una experiencia digital de alto nivel"</i>
</p>
