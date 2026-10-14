// Every fact below comes from the project's repository, the CV or the live site.
// Keep it that way: no invented metrics.

export const projects = [
  {
    slug: "medianet-incubator",
    title: "Medianet Incubator",
    tagline: "A startup incubation platform, from application to demo day",
    year: "2026",
    context: "Engineering final-year project · Medianet, Tunis",
    role: "Full-stack developer: architecture, backend, frontends, AI and deployment",
    duration: "Feb – Jul 2026 (6 months, Scrum)",
    categories: ["Full-stack", "AI"],
    featured: true,
    cover: "projects/medianet.jpg",
    stack: [
      "Spring Boot 3",
      "Java 21",
      "Spring Cloud Gateway",
      "Eureka",
      "Next.js 14",
      "TypeScript",
      "PostgreSQL",
      "RabbitMQ",
      "MinIO",
      "Python / FastAPI",
      "faster-whisper",
      "Docker",
      "GitHub Actions",
      "Azure",
    ],
    links: [{ label: "Live platform", url: "https://medianetincubator.duckdns.org/" }],
    stats: [
      { value: "270+", label: "REST endpoints" },
      { value: "6", label: "Spring Boot services" },
      { value: "51", label: "permissions across 13 modules" },
      { value: "5", label: "PostgreSQL databases" },
    ],
    challenge:
      "An incubator needs one public place to publish its programmes, collect applications, let a jury score them against each programme's own criteria, follow the selected startups, and run pitch days, with every role (admin, founder, jury, mentor) seeing only what it should.",
    features: [
      {
        title: "Programmes and public pages",
        text: "Admins create programmes with phases, sessions and weighted evaluation criteria, then compose each programme's public page from reusable blocks. The landing page is a small CMS with draft/publish and live preview.",
      },
      {
        title: "Applications and jury scoring",
        text: "Founders sign up (email or Google) and apply through per-programme forms. Jury members are assigned, score each criterion, and the weighted score is normalised so unequal weights still compare fairly.",
      },
      {
        title: "AI pitch coach",
        text: "Founders upload their pitch video. A self-hosted Python service transcribes it with faster-whisper, then an LLM returns a scored analysis on six pitch axes with strengths, weaknesses and concrete advice.",
      },
      {
        title: "AI application review",
        text: "An LLM scores applications against the programme's criteria and writes commentary to support, not replace, the jury.",
      },
      {
        title: "Role workspaces",
        text: "Founders, jury and mentors each get their own dashboard: tasks with document uploads and checklists, coaching notes, calendar and notifications.",
      },
      {
        title: "Dynamic RBAC",
        text: "Admins create roles and grant individual permissions. Permission changes reach open sessions live over Server-Sent Events, and a 403 names the exact permission that is missing.",
      },
    ],
    architecture: [
      { layer: "Clients", items: ["Next.js front office", "Next.js back office"] },
      { layer: "Edge", items: ["Nginx + Let's Encrypt", "Spring Cloud Gateway", "Eureka"] },
      {
        layer: "Services",
        items: ["auth", "programme", "candidature", "notification", "admin-ai", "pitch-media (Python)"],
      },
      { layer: "Data", items: ["PostgreSQL × 5", "RabbitMQ", "MinIO (S3)", "LLM (OpenAI-compatible / Ollama)"] },
    ],
    highlights: [
      "Database per service: services reference each other by id, not JPA relations, which keeps service boundaries clean.",
      "CI on every push compiles every Java service and type-checks and builds both Next.js apps; a deploy workflow builds the images and ships them.",
      "Deployed with Docker Compose on an Azure VM behind Nginx with HTTPS on three domains.",
    ],
    code: {
      file: "Evaluation.java",
      lang: "java",
      source: `public void calculateWeightedScore() {
    if (criteriaScores != null && !criteriaScores.isEmpty()) {
        // sum(score * weight) / sum(weight): unequal weights still work
        double weightedSum = 0;
        double totalWeight = 0;
        for (CriteriaScore cs : criteriaScores) {
            if (cs.getScore() != null && cs.getWeight() != null) {
                weightedSum += cs.getScore() * cs.getWeight();
                totalWeight += cs.getWeight();
            }
        }
        this.weightedScore = totalWeight > 0 ? weightedSum / totalWeight : null;
    }
}`,
    },
    gallery: [
      { src: "projects/medianet/home.jpg", caption: "Public landing page" },
      { src: "projects/medianet/programmes.jpg", caption: "Programme catalogue with search and status filters" },
      { src: "projects/medianet/register.jpg", caption: "Sign-up for founders, with Google sign-in" },
    ],
  },
  {
    slug: "gaminggear",
    title: "GamingGear.tn",
    tagline: "E-commerce store for PC hardware with a PC builder",
    year: "2023 – 2025",
    context: "Freelance / personal project",
    role: "Full-stack developer",
    categories: ["Full-stack", "E-commerce"],
    featured: true,
    cover: "projects/gaminggear.jpg",
    stack: ["Next.js (App Router)", "TypeScript", "Prisma", "PostgreSQL", "NextAuth", "Radix UI", "Tailwind CSS"],
    links: [
      { label: "Source code", url: "https://github.com/yassinecher/yyy" },
      { label: "Behance case", url: "https://www.behance.net/gallery/195543119/GamingGear" },
    ],
    challenge:
      "Selling PC parts means a large catalogue where every category has its own specs, plus customers who want a complete, compatible build rather than single parts.",
    features: [
      {
        title: "Catalogue across 20+ categories",
        text: "GPUs, motherboards, memory, storage, power supplies, cases, cooling, laptops, screens and peripherals, each with its own admin screens and fields.",
      },
      {
        title: "PC builder and compatibility profiles",
        text: "A build-a-PC flow backed by compatibility profiles, plus ready-made packs and custom bundles.",
      },
      {
        title: "Orders and invoices",
        text: "Orders and their invoices are managed from the back office.",
      },
      {
        title: "Admin back office",
        text: "Category management, homepage billboards and product editing, with NextAuth authentication through a Prisma adapter.",
      },
    ],
    highlights: [
      "Next.js App Router with the store and an admin route group in one codebase.",
      "UI built from accessible Radix primitives styled with Tailwind.",
    ],
  },
  {
    slug: "pc-build-recommender",
    title: "PC Build Recommender",
    tagline: "Machine-learning suggestions for compatible PC builds",
    year: "2025",
    context: "Personal project · machine learning",
    role: "Data preparation, modelling and API",
    categories: ["AI"],
    featured: true,
    cover: "projects/pcbuild.jpg",
    stack: ["Python", "scikit-learn", "pandas", "NumPy", "Flask", "Jupyter"],
    links: [{ label: "Source code", url: "https://github.com/yassinecher/PcPartsRecommendationAi" }],
    challenge:
      "Choosing compatible parts is hard for non-experts: socket, memory type, power and size all have to line up, and the best choice depends on what the machine is for.",
    features: [
      {
        title: "Component datasets",
        text: "25 component datasets (CPUs, GPUs, motherboards, memory, PSUs, cases and more), cleaned and verified with dedicated scripts.",
      },
      {
        title: "Compatibility rules",
        text: "Critical fields per part type (CPU socket, motherboard memory type and form factor, PSU wattage, GPU TDP and length) keep suggestions buildable.",
      },
      {
        title: "Models",
        text: "Scaled numeric features feed a k-nearest-neighbours model and K-Means clustering of builds; k-NN and SVM classifiers were compared on F1 score in the training notebook.",
      },
      {
        title: "REST API",
        text: "A Flask endpoint, POST /recommend, validates the requested features, fills defaults and returns the closest builds.",
      },
    ],
    code: {
      file: "main.py",
      lang: "python",
      source: `feature_cols = [
    'CPU_Core_Count', 'CPU_Performance_Core_Clock',
    'Memory_Speed', 'Video Card_Memory', 'Power Supply_Wattage'
]
X = build_table[feature_cols].astype(float)
X_scaled = scaler.transform(X)
knn_model = joblib.load(os.path.join(MODELS_DIR, 'knn_model.pkl'))

@app.route('/recommend', methods=['POST'])
def recommend_builds():
    user_input = request.get_json()
    ...`,
    },
  },
  {
    slug: "batigo",
    title: "Batigo",
    tagline: "Construction project management: projects, sites, suppliers and budgets",
    year: "2025",
    context: "Academic project · ESPRIT",
    role: "Full-stack developer",
    categories: ["Full-stack"],
    featured: true,
    cover: "projects/batigo.jpg",
    stack: ["Spring Boot 3", "Spring Security", "JWT", "JPA", "MySQL", "Angular 16", "OpenAPI", "JaCoCo"],
    links: [
      { label: "Backend code", url: "https://github.com/yassinecher/batigo-backend" },
      { label: "Frontend code", url: "https://github.com/yassinecher/batigo-client" },
    ],
    challenge:
      "Construction companies juggle projects, tasks, deliveries, suppliers, inspections and money in separate places; Batigo brings them into one application.",
    features: [
      {
        title: "Projects, tasks and workflows",
        text: "Create projects, assign tasks, follow workflows and deliverables.",
      },
      {
        title: "Incidents and inspections",
        text: "Log and resolve site incidents, run inspections, and export incidents to Excel (Apache POI).",
      },
      {
        title: "Suppliers, products and orders",
        text: "Supplier management, a product catalogue with categories, cart, orders and delivery tracking.",
      },
      {
        title: "Finance and prediction",
        text: "Income and expense tracking, financial statistics, and a budget-prediction endpoint for projects.",
      },
      {
        title: "Reports and notifications",
        text: "PDF generation (iText), e-mail and SMS notifications (Twilio), and statistics dashboards.",
      },
    ],
    highlights: [
      "JWT authentication with Spring Security, documented with springdoc OpenAPI.",
      "Test coverage measured with JaCoCo.",
    ],
    code: {
      file: "PredictionController.java",
      lang: "java",
      source: `@RestController
@RequestMapping("/api/prediction")
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/budget")
    public ResponseEntity<Double> predictBudget(@RequestBody ProjetFinanciereDTO projet) {
        return ResponseEntity.ok(predictionService.predictBudget(projet));
    }
}`,
    },
  },
  {
    slug: "mindtrack",
    title: "MindTrack",
    tagline: "Mobile mood journal with charts, reminders and an AI companion",
    year: "2025",
    context: "Mobile app",
    role: "Mobile developer",
    categories: ["Mobile", "AI"],
    featured: true,
    cover: "projects/mindtrack.jpg",
    stack: ["Flutter", "Dart", "Firebase Auth", "Cloud Firestore", "Gemini", "SQLite", "fl_chart", "GetX"],
    links: [{ label: "Source code", url: "https://github.com/yassinecher/mindtrack" }],
    challenge:
      "People who want to understand their mood need a quick way to log it, see patterns over time, and get gentle suggestions, on their phone.",
    features: [
      {
        title: "Mood journal",
        text: "Log moods with emotions, notes and voice entries; browse them in a calendar and a journal view.",
      },
      {
        title: "Trends and statistics",
        text: "Charts of mood trends and stats, plus a weekly stress prediction weighted by the emotions recorded.",
      },
      {
        title: "AI companion",
        text: "A Gemini-powered chat and AI-suggested activities, alongside a library of advice.",
      },
      {
        title: "Reminders and export",
        text: "Local notifications with history, and export of the user's data.",
      },
    ],
  },
  {
    slug: "oscar-recrutement",
    title: "OscarRecrutement",
    tagline: "Job board connecting employers and candidates",
    year: "2025",
    context: "Academic / personal project",
    role: "Full-stack developer",
    categories: ["Full-stack"],
    featured: false,
    cover: "projects/oscar.jpg",
    stack: ["Angular 15", "Angular Material", "PrimeNG", "Tailwind CSS", "Spring Boot 3", "JWT", "PostgreSQL"],
    links: [
      { label: "Frontend code", url: "https://github.com/yassinecher/OscarFrontend" },
      { label: "Admin code", url: "https://github.com/yassinecher/OscarRecrutement---admin" },
    ],
    challenge:
      "Employers need to publish offers and review applicants; candidates need to search offers, keep their CVs and follow their applications.",
    features: [
      {
        title: "Employer space",
        text: "Company profile, post and edit offers, review applications and candidate CVs from a dashboard.",
      },
      {
        title: "Candidate space",
        text: "Search offers with keyword, salary, job type, category and experience filters; apply, manage CVs with a CV form, and track applications.",
      },
      {
        title: "Backend",
        text: "Spring Boot REST API with JWT authentication, e-mail, search suggestions and OpenAPI documentation.",
      },
    ],
  },
  {
    slug: "appointmentease",
    title: "AppointmentEase",
    tagline: "Appointment management web app",
    year: "2023",
    context: "Bachelor final-year internship",
    role: "Full-stack developer (Angular & Spring Boot)",
    categories: ["Full-stack"],
    featured: false,
    cover: "projects/appotmentease.jpg",
    stack: ["Angular 15", "Spring Boot", "Chart.js", "OpenAI API"],
    links: [
      { label: "Source code", url: "https://github.com/yassinecher/AppointmentEase" },
      { label: "Behance case", url: "https://www.behance.net/gallery/195540733/AppoitmentEase" },
    ],
    challenge: "Booking and managing appointments with separate spaces for each type of user.",
    features: [
      {
        title: "Angular front end",
        text: "Dynamic modules, reactive forms, dashboards with Chart.js, and OpenAI API integration.",
      },
      {
        title: "Spring Boot back end",
        text: "REST APIs with JPA entities, validation and secured endpoints.",
      },
    ],
  },
  {
    slug: "auxtar-group",
    title: "Auxtar Group",
    tagline: "Company website for a client",
    year: "2023",
    context: "Freelance",
    role: "Web developer",
    categories: ["Web"],
    featured: false,
    cover: "projects/auxtar.jpg",
    stack: ["WordPress", "Elementor"],
    links: [{ label: "Behance case", url: "https://www.behance.net/gallery/195545695/Auxstargroup" }],
    challenge: "A client needed a professional company site they could update themselves.",
    features: [
      {
        title: "WordPress + Elementor",
        text: "A responsive site built with WordPress and Elementor so the client can edit content without code.",
      },
    ],
  },
];

// Smaller work without a public repository or screenshots (from the CV).
export const otherWork = [
  {
    title: "AI emergency response platform",
    text: "In progress: call prioritisation, demand forecasting and ambulance dispatch with machine learning.",
  },
  {
    title: "PedaFlux",
    text: "Education platform: courses, teachers, groups, assessments and notifications. Angular, Spring Boot, MySQL.",
  },
  {
    title: "Guidiny",
    text: "Symfony platform connecting certified tour guides with travellers: bookings, profiles, reviews, admin back office.",
  },
  {
    title: "Orange Digital Center IoT hackathon",
    text: "Connected prototype with sensors and microcontrollers streaming to a real-time dashboard.",
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
