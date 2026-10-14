export const profile = {
  name: "Yassine Cherni",
  title: "Full-stack software engineer",
  pitch:
    "I build complete web platforms: Spring Boot microservices, Next.js and Angular front ends, AI features and the pipelines that ship them.",
  email: "yassinecherni9@gmail.com",
  phone: "+216 93 634 120",
  location: "Tunisia",
  github: "https://github.com/yassinecher",
  linkedin: "https://www.linkedin.com/in/yassine-cherni-0545b8254",
  // Drop the exported PDF at public/cv/Yassine_Cherni_CV.pdf; the button appears only when it exists.
  cv: "cv/Yassine_Cherni_CV.pdf",
};

export const stack = [
  {
    group: "Backend",
    items: ["Java", "Spring Boot 3", "Spring Cloud", "Spring Security / JWT", "JPA / Hibernate", "Node.js / Express", "FastAPI"],
  },
  {
    group: "Frontend",
    items: ["TypeScript", "Next.js", "React", "Angular", "Tailwind CSS", "Three.js / R3F"],
  },
  {
    group: "Data & infra",
    items: ["PostgreSQL", "MySQL", "RabbitMQ", "MinIO", "Docker", "GitHub Actions", "Nginx", "Azure"],
  },
  {
    group: "AI & mobile",
    items: ["LLM integration", "Whisper", "scikit-learn", "Flutter", "Firebase"],
  },
];

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "French", level: "B2" },
  { name: "English", level: "B2" },
];

export const experience = [
  {
    period: "Feb – Jul 2026",
    title: "Full-stack developer · final-year project",
    org: "Medianet, Tunis",
    text: "Built and deployed the Medianet Incubator platform: Spring Boot microservices, two Next.js apps, AI pitch analysis.",
    project: "medianet-incubator",
  },
  {
    period: "2025",
    title: "Web developer intern",
    org: "WEBUP, Tunis",
    text: "Front-end and back-end features for client applications with Angular, Spring Boot and MySQL.",
  },
  {
    period: "2024",
    title: "Full-stack JavaScript intern",
    org: "Web development internship",
    text: "Responsive React and Angular interfaces; Express.js APIs on a NoSQL database.",
  },
  {
    period: "2023",
    title: "Full-stack developer · bachelor final-year internship",
    org: "Angular & Spring Boot",
    text: "REST APIs, JPA entities, validation and security; dynamic Angular modules and reactive forms.",
    project: "appointmentease",
  },
  {
    period: "2019 – now",
    title: "Freelance full-stack developer",
    org: "Remote",
    text: "Showcase sites, dashboards, e-commerce and 3D web experiences with Next.js, React and Three.js.",
  },
];

export const education = [
  { period: "2023 – 2026", title: "Engineering degree in Computer Science", org: "ESPRIT, Ariana" },
  { period: "2020 – 2023", title: "Higher technician diploma in Computer Science", org: "ISET Le Kef" },
];
