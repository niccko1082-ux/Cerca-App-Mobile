src/
├── domain/           <-- NÚCLEO: Entidades e Interfaces / Puertos (TypeScript puro) [cite: 63, 64]
├── application/      <-- CASOS DE USO: Lógica de negocio (LoginUseCase, etc.) [cite: 65, 66]
├── infrastructure/   <-- ADAPTADORES: Conexiones externas (Axios, SecureStore, APIs) [cite: 67, 68]
│
├── app/              <-- PRESENTACIÓN: Pantallas y Rutas de Expo Router [cite: 14, 69]
├── components/       <-- PRESENTACIÓN: Componentes UI reutilizables
├── hooks/            <-- PRESENTACIÓN: Hooks de UI o controladores
└── constants/        <-- Configuración global de la App