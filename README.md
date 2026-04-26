# DB Designer — Visual Database Schema Builder

**DB Designer** is a premium, visual-first tool for designing database schemas. Built for developers who want to skip the tedious SQL writing and focus on the architecture. Design your tables, drag relationships, and export production-ready SQL in seconds.

**DB Designer** es una herramienta premium enfocada en lo visual para diseñar esquemas de bases de datos. Creada para desarrolladores que buscan evitar la tediosa escritura manual de SQL y centrarse en la arquitectura. Diseña tus tablas, arrastra relaciones y exporta código SQL listo para producción en segundos.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![ReactFlow](https://img.shields.io/badge/React_Flow-FF0073?style=flat)

---

## Features

- **Infinite Canvas:** A smooth, interactive workspace to map out your entire database architecture.
- **Smart Relations:** Drag and drop connections between tables to define 1:1, 1:N, or N:M relationships.
- **Instant SQL Generation:** Automatically generates clean, standard SQL `CREATE TABLE` scripts with Foreign Key constraints.
- **Cloud Sync:** Securely save and manage your diagrams in the cloud using Supabase.
- **Premium Aesthetics:** Sleek dark mode design with modern typography and fluid animations.
- **Templates:** Start instantly with pre-built schemas for E-Commerce or Blogs.

## Tech Stack

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Node Engine:** [React Flow](https://reactflow.dev/) (Interactive diagrams)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend/Auth:** [Supabase](https://supabase.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/db-designer.git
   cd db-designer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## SQL Export Example

The tool generates production-ready code like this:

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE posts (
  id BIGINT PRIMARY KEY NOT NULL,
  author_id BIGINT REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT
);
```

## 👤 Author

**Ronald**

- Portfolio: [https://portafolio-iota-blush-71.vercel.app/]
- LinkedIn: [https://www.linkedin.com/in/ronald-garavito-0320b927a/]
- GitHub: [https://github.com/ronaldgaravito]

---

_Created with passion for the developer community._
