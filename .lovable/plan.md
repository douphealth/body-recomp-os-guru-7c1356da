

# GearUpToFit Body Recomp OS

A premium, formula-based body recomposition planner that generates personalized calorie targets, macro splits, 8-week training plans, cardio guidance, recovery checklists, and habit plans — with context-aware internal links to GearUpToFit.com content.

## Brand & Design
- Dark theme matching gearuptofit.com (dark background, red accents, bold uppercase headings)
- "GEAR UP TO FIT" logo/wordmark in header with red "TO FIT" accent
- Fully responsive — mobile-first design
- Professional card-based layouts with smooth transitions between steps

## Pages & Routes

### `/` — Landing / CTA Page
- Hero section: **"Build My 8-Week Fitness Plan"** with bold headline and red CTA button
- Brief value proposition cards (Calories • Macros • Workouts • Recovery • Habits)
- Trust signals linking to gearuptofit.com/about-us/
- Quick preview of what the plan includes

### `/app/body-recomp` — Multi-Step Input Wizard
- **Step 1**: Age, sex, height, weight, body-fat estimate (with visual guide)
- **Step 2**: Goal (fat loss / lean muscle / recomp), workout frequency, step count
- **Step 3**: Diet style (standard, keto, high-protein, vegetarian), equipment access (gym, home, minimal), running interest (yes/no)
- Progress bar, back/next navigation, input validation
- Email signup/login gate before generating results (Supabase Auth)

### `/app/body-recomp/results` — Personalized Plan Dashboard
- **Quick Answer Summary** at top (one-paragraph snapshot of the entire plan)
- **Calorie Target** card — TDEE via Mifflin-St Jeor, deficit/surplus based on goal
- **Protein & Macro Split** card — protein target (g/kg), carb/fat distribution
- **8-Week Training Split** — phased program based on frequency, equipment, and goal
- **Cardio Plan** — based on step count, running interest, and goal
- **Recovery Checklist** — sleep, hydration, deload week, stretching
- **Habit Formation Plan** — weekly habit stacking suggestions
- **"Today / This Week / Next Best Article"** panel — context-aware GearUpToFit links
- **Top 3 Next Reads** — cherry-picked links based on user profile

### Public Result Template Pages (static/prerendered content pages for SEO)
- `/app/body-recomp/fat-loss-beginner-home-workouts`
- `/app/body-recomp/runner-cut-plan`
- `/app/body-recomp/lean-muscle-high-protein`
- Each with unique meta titles, descriptions, FAQ section, JSON-LD structured data, and internal links

## Cherry-Picked Internal Links (injected contextually)
- **Homepage** — https://gearuptofit.com/ (broad discovery, shown in all results)
- **About page** — https://gearuptofit.com/about-us/ (trust/E-E-A-T, shown in footer/trust section)
- **Running shoe guide** — https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/ (shown when plan includes running)
- **Running shoes hub** — https://gearuptofit.com/review/running-shoes/ (shown when running interest = yes)
- Additional contextual links to fitness, nutrition, weight-loss, and health categories based on user goals

## User Accounts (Supabase Auth)
- Email/password signup before plan generation
- Save and revisit plans
- Profile with saved preferences

## SEO & AI Search Optimization
- Custom meta tags with unique title/description per page
- JSON-LD structured data: FAQ, Breadcrumb, Article schemas on result template pages
- "Quick answer" summary block above the fold on every result page
- Semantic HTML with proper heading hierarchy
- Open Graph tags for social sharing

## Calculation Engine (Formula-Based)
- **TDEE**: Mifflin-St Jeor equation × activity multiplier
- **Calorie target**: TDEE ± adjustment based on goal (fat loss: -20%, lean muscle: +10%, recomp: maintenance with cycling)
- **Protein**: 1.6-2.2 g/kg lean body mass based on goal
- **Macro split**: Protein-first, then fat/carb distribution based on diet style
- **Training split**: Generated based on frequency (3-6 days), equipment, and goal
- **Cardio**: Based on step count baseline, running interest, and goal phase

## Event Tracking
- CTA clicks, result page views, internal link clicks tracked via custom analytics hooks (console-based, extensible)

