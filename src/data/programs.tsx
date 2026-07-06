import { ReactNode } from "react";
import {
  FaDumbbell,
  FaHeartPulse,
  FaPersonRunning,
  FaFire,
  FaBullseye,
  FaUserCheck,
  FaScaleBalanced,
  FaAppleWhole,
} from "react-icons/fa6";

export interface Program {
  slug: string;
  title: string;
  icon: ReactNode;
  image: string;
  text: string; // Short summary for list view
  description: string; // Long description for detail view
  duration: string;
  intensity: string;
  targetAudience: string;
  benefits: string[];
  schedule: string;
}

export const programs: Program[] = [
  {
    slug: "strength-training",
    title: "Strength Training",
    icon: <FaDumbbell />,
    image: "/images/strength-training.jpg",
    text: "Build lean muscle, increase strength, and improve performance with progressive resistance training. Coaches guide your form, load selection, and weekly progression so every session moves you forward.",
    description: "Strength training is the cornerstone of a healthy, active lifestyle. Our program is designed for all fitness levels, focusing on compound movements like squats, deadlifts, presses, and pulls. Under the guidance of our expert coaches, you will learn correct form, proper lifting technique, and how to apply progressive overload safely. Whether your goal is to tone up, build maximum strength, or support athletic performance, we provide a structured plan and a supportive community to help you succeed.",
    duration: "60 Mins",
    intensity: "High",
    targetAudience: "Anyone looking to build muscle, increase bone density, and boost metabolism.",
    benefits: [
      "Increase lean muscle mass and definition",
      "Improve joint stability, posture, and core strength",
      "Boost metabolic rate for long-term fat loss",
      "Enhance bone density and physical resilience",
    ],
    schedule: "Mon, Wed, Fri - 6:00 AM, 5:00 PM | Tue, Thu - 7:00 PM",
  },
  {
    slug: "cardio-fitness",
    title: "Cardio Fitness",
    icon: <FaHeartPulse />,
    image: "/images/cardio-training.jpg",
    text: "Improve endurance, heart health, and calorie burn through structured treadmill, bike, rowing, and circuit sessions. Workouts are adjusted to your stamina so you can train hard without burning out.",
    description: "Elevate your cardiovascular health with our dynamic Cardio Fitness program. We combine heart-rate-monitored interval training, steady-state cardio, and circuit conditioning to maximize caloric burn and build robust stamina. Using state-of-the-art treadmills, rowers, stationary bikes, and bodyweight exercises, our coaches structure each workout to push your limits safely. This program is highly scalable, ensuring beginners can build a strong foundation while seasoned athletes can enhance their aerobic capacity.",
    duration: "45 Mins",
    intensity: "Medium to High",
    targetAudience: "Individuals wanting to improve heart health, burn calories, and boost endurance.",
    benefits: [
      "Enhance cardiovascular capacity and lung health",
      "Increase daily energy levels and stamina",
      "Sustain efficient calorie burn for weight management",
      "Reduce stress and improve overall sleep quality",
    ],
    schedule: "Tue, Thu, Sat - 7:00 AM, 6:00 PM | Mon, Wed - 8:00 AM",
  },
  {
    slug: "yoga-wellness",
    title: "Yoga & Wellness",
    icon: <FaPersonRunning />,
    image: "/images/yoga-wellness.jpg",
    text: "Restore mobility, flexibility, breathing control, and balance with guided wellness sessions. This program helps reduce tension, improve posture, and support recovery between harder training days.",
    description: "Find your balance, reduce stress, and restore your body with our Yoga & Wellness program. These classes focus on alignment, breath control, flexibility, and mindfulness. It is the perfect complement to high-intensity training, helping to release muscle tension, prevent injuries, and improve overall mobility. Whether you are a beginner looking to stretch or a seasoned practitioner, our instructors guide you through postures (asanas) and breathing techniques (pranayama) that restore physical and mental harmony.",
    duration: "60 Mins",
    intensity: "Low to Medium",
    targetAudience: "Perfect for recovery, flexibility, stress relief, and mindfulness.",
    benefits: [
      "Improve flexibility and joint range of motion",
      "Enhance core stability, posture, and balance",
      "Lower stress, reduce anxiety, and promote mental clarity",
      "Accelerate physical recovery between intense training days",
    ],
    schedule: "Daily - 8:00 AM, 4:00 PM",
  },
  {
    slug: "crossfit-training",
    title: "CrossFit Training",
    icon: <FaFire />,
    image: "/images/crossfit-weights.jpg",
    text: "Train with high-intensity functional movements that combine strength, conditioning, and athletic skill. Each session focuses on full-body effort, coaching cues, and measurable progress.",
    description: "CrossFit combines the best aspects of gymnastics, Olympic weightlifting, powerlifting, running, rowing, and more. Our CrossFit program focuses on constantly varied, high-intensity functional movements that prepare you for any physical challenge. Each Workout of the Day (WOD) is designed to test your fitness limits, build camaraderie, and produce measurable results. Under the watchful eye of certified trainers, you will perform movements safely while pushing yourself to new heights alongside a passionate and encouraging community.",
    duration: "60 Mins",
    intensity: "Very High",
    targetAudience: "Athletic individuals, thrill-seekers, and those looking for high-intensity, varied functional workouts.",
    benefits: [
      "Build comprehensive functional fitness across all domains",
      "Improve speed, power, coordination, and athletic agility",
      "High caloric burn during and long after workouts (EPOC)",
      "Supportive, tight-knit community and group motivation",
    ],
    schedule: "Mon, Wed, Fri - 7:00 AM, 6:00 PM | Sat - 9:00 AM",
  },
  {
    slug: "hiit-training",
    title: "HIIT Training",
    icon: <FaBullseye />,
    image: "/images/kettlebell.jpg",
    text: "Push through short bursts of intense exercise followed by strategic recovery periods. HIIT is ideal for improving conditioning, burning calories, and building explosive fitness in less time.",
    description: "High-Intensity Interval Training (HIIT) is the most time-efficient way to get fit. In our HIIT sessions, you will give 100% effort through quick, intense bursts of exercise, followed by short, active recovery periods. This training keeps your heart rate up and burns more fat in less time than traditional cardio. We utilize kettlebells, dumbbells, battle ropes, and bodyweight movements to keep the routines fresh, fast-paced, and highly effective for boosting cardiovascular health and metabolism.",
    duration: "30-45 Mins",
    intensity: "High",
    targetAudience: "Busy individuals looking for maximum workout efficiency and rapid fat loss.",
    benefits: [
      "Maximize calorie burn in minimum time",
      "Boost metabolic rate for hours after training",
      "Improve cardiovascular fitness and stamina",
      "No experience or special skills required - fully scalable",
    ],
    schedule: "Tue, Thu - 6:30 AM, 5:30 PM | Sat - 8:00 AM",
  },
  {
    slug: "personal-training",
    title: "Personal Training",
    icon: <FaUserCheck />,
    image: "/images/group-training.jpg",
    text: "Work one-on-one with a coach who builds a plan around your goals, schedule, and current fitness level. You get form correction, accountability, exercise selection, and progress tracking every step of the way.",
    description: "Achieve your specific fitness goals faster with our premium Personal Training program. You will be matched with a dedicated coach who creates a fully customized exercise and nutrition plan tailored to your body type, goals, and schedule. During each one-on-one session, your coach provides expert instruction, corrects form in real-time, keeps you motivated, and adjusts your plan as you progress. This program offers the highest level of accountability, safety, and personalized support.",
    duration: "60 Mins",
    intensity: "Customized",
    targetAudience: "Anyone seeking specialized attention, customized programs, or maximum accountability.",
    benefits: [
      "Fully customized training and nutrition plans built for you",
      "One-on-one guidance, safety focus, and form correction",
      "Flexible scheduling to fit your lifestyle",
      "Accelerated results with high accountability and weekly tracking",
    ],
    schedule: "By Appointment (Flexible Hours)",
  },
  {
    slug: "weight-loss-program",
    title: "Weight Loss Program",
    icon: <FaScaleBalanced />,
    image: "/images/equipment-row.jpg",
    text: "Combine smart training, realistic nutrition habits, and regular check-ins to lose weight sustainably. The focus is fat loss, strength retention, consistency, and routines you can maintain.",
    description: "Our Weight Loss Program is not about extreme dieting or grueling workouts—it is about sustainable lifestyle transformation. We combine effective resistance and cardio training with practical nutrition habits and behavioral coaching. The focus is on losing body fat while preserving lean muscle mass, ensuring a toned appearance and a healthy metabolism. Weekly check-ins, body composition tracking, and a supportive environment keep you on track toward your long-term wellness goals.",
    duration: "60 Mins",
    intensity: "Medium",
    targetAudience: "Those looking to lose body fat, build sustainable habits, and transform their composition.",
    benefits: [
      "Sustainable, non-restrictive fat loss and toning",
      "Preserve muscle mass and boost metabolism",
      "Weekly coaching check-ins and body scans",
      "Learn healthy habits for long-term weight maintenance",
    ],
    schedule: "Mon, Tue, Thu, Fri - 8:30 AM, 6:30 PM",
  },
  {
    slug: "nutrition-coaching",
    title: "Nutrition Coaching",
    icon: <FaAppleWhole />,
    image: "/images/calm-yoga.jpg",
    text: "Learn how to fuel workouts, manage portions, balance meals, and build habits that support your fitness goals. Coaching is practical, flexible, and designed around foods you actually enjoy.",
    description: "Training is only half the equation; what you put into your body is just as important. Our Nutrition Coaching program provides you with the knowledge, tools, and habits to fuel your active lifestyle. We work with you to design a flexible nutrition strategy that fits your preferences, cultural background, and daily schedule. There are no gimmicks or starvation diets here—just evidence-based coaching, portion management techniques, meal planning guides, and ongoing accountability to build a healthy relationship with food.",
    duration: "30-45 Mins (Sessions)",
    intensity: "Low",
    targetAudience: "Anyone looking to optimize their diet, improve recovery, and build better eating habits.",
    benefits: [
      "Customized macronutrient and calorie guidelines",
      "Practical meal prep strategies and food swaps",
      "Improved digestion, energy, and recovery",
      "No crash diets - focus on long-term sustainability",
    ],
    schedule: "By Appointment (Weekly/Bi-weekly Reviews)",
  },
];
