// ============================================================
// concepts/conceptData.ts
// All concept definitions, steps, and explanation data.
// Future: Replace static data with AI-generated explanations.
// ============================================================

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Subject = 'Geometry' | 'Algebra' | 'Physics' | 'Finance';

export interface ExplanationStep {
  id: number;
  title: string;
  explanation: string;
  analogy: string;
  observation: string;
  highlightFormula?: string;
}

export interface Concept {
  id: string;
  title: string;
  subject: Subject;
  difficulty: Difficulty;
  description: string;
  icon: string;
  color: string;          // Tailwind color class base
  accentColor: string;    // Hex for canvas
  steps: ExplanationStep[];
  formula: string;
}

export const CONCEPTS: Concept[] = [
  {
    id: 'triangle-area',
    title: 'Area of Triangle',
    subject: 'Geometry',
    difficulty: 'Beginner',
    description: 'Discover why every triangle is exactly half a rectangle — and why that gives us the formula.',
    icon: '▲',
    color: 'blue',
    accentColor: '#4F8EF7',
    formula: 'A = ½ × b × h',
    steps: [
      {
        id: 1,
        title: 'Start with what you know',
        explanation: 'We already know how to find the area of a rectangle — it\'s just width × height. Let\'s use that knowledge to understand the triangle.',
        analogy: 'Think of a rectangle as a piece of paper. You know exactly how much area it covers.',
        observation: 'Every rectangle has 4 right angles and two pairs of equal sides.',
        highlightFormula: 'Rectangle Area = Base × Height',
      },
      {
        id: 2,
        title: 'Split the rectangle',
        explanation: 'Watch what happens when we draw a diagonal line from one corner to the opposite corner. The rectangle splits into two pieces.',
        analogy: 'Like cutting a sandwich diagonally — you get two identical triangular halves.',
        observation: 'The diagonal always creates exactly 2 equal triangles. Always.',
      },
      {
        id: 3,
        title: 'One triangle is half',
        explanation: 'We can see that our triangle is exactly one half of the rectangle. So its area must be half of the rectangle\'s area.',
        analogy: 'If a pizza (rectangle) costs ₹100, each half costs ₹50. Same logic!',
        observation: 'No matter how you tilt the diagonal, the two triangles are always equal in area.',
      },
      {
        id: 4,
        title: 'The formula emerges',
        explanation: 'Since the rectangle\'s area is Base × Height, and our triangle is exactly half — the triangle\'s area must be ½ × Base × Height. You just derived the formula!',
        analogy: 'You didn\'t memorize it. You discovered it by thinking logically.',
        observation: 'The ½ isn\'t magic. It\'s literally because a triangle is half a rectangle.',
        highlightFormula: 'Area = ½ × Base × Height',
      },
      {
        id: 5,
        title: 'Try it yourself',
        explanation: 'Drag the triangle\'s vertices to change its shape. Watch how the base and height measurements update, and see the area recalculate in real time.',
        analogy: 'A tall thin triangle and a short wide triangle with the same base × height have the same area. Surprising?',
        observation: 'The formula works for ALL triangles — not just right triangles!',
        highlightFormula: 'Area = ½ × Base × Height',
      },
    ],
  },
  {
    id: 'rectangle-area',
    title: 'Rectangle Area',
    subject: 'Geometry',
    difficulty: 'Beginner',
    description: 'See how unit squares tile a rectangle perfectly, building intuition for multiplication as area.',
    icon: '▬',
    color: 'teal',
    accentColor: '#00D4AA',
    formula: 'A = l × w',
    steps: [
      {
        id: 1,
        title: 'What does "area" mean?',
        explanation: 'Area is simply how many unit squares fit inside a shape. Imagine floor tiles — the area is the number of tiles you need.',
        analogy: 'You\'re tiling a bathroom floor. How many 1×1 tiles do you need? That\'s the area.',
        observation: 'Area is always measured in square units: cm², m², km².',
      },
      {
        id: 2,
        title: 'Fill one row',
        explanation: 'Let\'s place tiles one row at a time. In a rectangle of width 5, you can fit exactly 5 tiles in one row.',
        analogy: 'Like arranging chocolates in a box — first fill one row across.',
        observation: 'Each row has exactly as many tiles as the width of the rectangle.',
      },
      {
        id: 3,
        title: 'Stack the rows',
        explanation: 'Now we add more rows, one by one. Each row is identical. If height is 3, we need 3 rows of 5 tiles each.',
        analogy: 'Stacking shelves of chocolates. 3 shelves × 5 chocolates per shelf = 15 total.',
        observation: 'The total is always rows × columns — length × width.',
        highlightFormula: 'Area = Length × Width',
      },
      {
        id: 4,
        title: 'Drag and discover',
        explanation: 'Drag the rectangle\'s edges to change its dimensions. Watch the tiles fill in and count update live.',
        analogy: 'Real architects use this exact principle when designing rooms.',
        observation: 'A 4×6 rectangle and a 3×8 rectangle have the same area (24). Shape changes, area can stay the same!',
        highlightFormula: 'Area = l × w',
      },
    ],
  },
  {
    id: 'circle-area',
    title: 'Circle Area',
    subject: 'Geometry',
    difficulty: 'Intermediate',
    description: 'Watch a circle transform into a rectangle, revealing why π appears in the formula.',
    icon: '●',
    color: 'violet',
    accentColor: '#7C5CFC',
    formula: 'A = π × r²',
    steps: [
      {
        id: 1,
        title: 'The puzzle of the circle',
        explanation: 'Rectangles are easy — just length × width. But circles have no straight edges. How do we measure their area?',
        analogy: 'Imagine measuring the area of a pizza. You can\'t use a ruler easily.',
        observation: 'All circles have the same shape — just different sizes. The ratio of circumference to diameter is always π ≈ 3.14159.',
      },
      {
        id: 2,
        title: 'Slice into sectors',
        explanation: 'Let\'s cut the circle into equal pizza slices (sectors). The more slices, the more accurate our calculation will be.',
        analogy: 'Like cutting a pizza into 8, 16, or 32 slices. More cuts = more precision.',
        observation: 'Each sector is like a thin triangle with height equal to the radius r.',
      },
      {
        id: 3,
        title: 'Rearrange into a rectangle',
        explanation: 'Now flip alternating slices and fit them together. They form a shape that looks almost like a rectangle!',
        analogy: 'Like rearranging the pizza slices — alternating pointing up and down — to form a rectangle.',
        observation: 'The more sectors you use, the more the shape looks like a perfect rectangle.',
      },
      {
        id: 4,
        title: 'Read the rectangle\'s dimensions',
        explanation: 'The rectangle\'s height is r (the radius). Its width is half the circumference = πr. So area = height × width = r × πr = πr²!',
        analogy: 'We turned an impossible problem into an easy one by rearranging.',
        observation: 'π (pi) appears naturally because it\'s the ratio between circumference and diameter.',
        highlightFormula: 'Area = π × r²',
      },
      {
        id: 5,
        title: 'Explore with radius',
        explanation: 'Drag to change the radius. Notice how area grows with the square of the radius — doubling r gives 4× the area!',
        analogy: 'Doubling a pizza\'s diameter doesn\'t double the pizza — it quadruples it!',
        observation: 'This is why r² (r squared) appears — area grows quadratically with radius.',
        highlightFormula: 'Area = π × r²',
      },
    ],
  },
  {
    id: 'pythagoras',
    title: "Pythagoras' Theorem",
    subject: 'Geometry',
    difficulty: 'Intermediate',
    description: 'See squares literally grow on triangle sides, making a² + b² = c² visually obvious.',
    icon: '△',
    color: 'amber',
    accentColor: '#F5A623',
    formula: 'a² + b² = c²',
    steps: [
      {
        id: 1,
        title: 'Meet the right triangle',
        explanation: 'A right triangle has one 90° angle. The longest side (opposite the right angle) is called the hypotenuse (c). The other two sides are legs (a and b).',
        analogy: 'Think of a ramp — the slanted part is the hypotenuse, always longer than the two sides.',
        observation: 'The right angle is marked with a small square symbol at the corner.',
      },
      {
        id: 2,
        title: 'Build squares on each side',
        explanation: 'Let\'s draw a perfect square on each side of the triangle. The square on side a has area a², on side b has area b², and on the hypotenuse has area c².',
        analogy: 'Like building rooms off each wall of a triangular courtyard.',
        observation: 'The areas of the squares are what matters, not their sizes alone.',
      },
      {
        id: 3,
        title: 'The magic of the areas',
        explanation: 'Watch carefully: the area of the square on side a, plus the area on side b, exactly equals the area on side c. Every single time.',
        analogy: 'Two small fields combined have the same area as one big field. The shapes are different but areas balance perfectly.',
        observation: 'This is NOT a coincidence. It works for every right triangle in existence.',
        highlightFormula: 'a² + b² = c²',
      },
      {
        id: 4,
        title: 'Drag the triangle',
        explanation: 'Move the vertices to change a and b. Watch the squares resize and the areas update. The equation always holds true!',
        analogy: 'Ancient builders used 3-4-5 triangles (3²+4²=5²=25) to make perfectly square corners.',
        observation: 'The classic 3-4-5 right triangle: 9 + 16 = 25. Verify it!',
        highlightFormula: 'a² + b² = c²',
      },
    ],
  },
  {
    id: 'simple-interest',
    title: 'Simple Interest',
    subject: 'Finance',
    difficulty: 'Beginner',
    description: 'Watch money grow linearly over time, building intuition for principal, rate, and time.',
    icon: '₹',
    color: 'teal',
    accentColor: '#00D4AA',
    formula: 'I = P × R × T',
    steps: [
      {
        id: 1,
        title: 'What is interest?',
        explanation: 'When you lend money to a bank (deposit), they pay you extra for using it. That extra money is called interest.',
        analogy: 'Like charging rent for lending your house — you get paid for someone using your property.',
        observation: 'Interest is how money "works" for you while you sleep.',
      },
      {
        id: 2,
        title: 'The principal grows each year',
        explanation: 'If you deposit ₹1000 at 10% per year, you earn ₹100 every year. Each bar in the chart shows one year of growth.',
        analogy: 'It\'s like getting a fixed salary every year just for depositing money.',
        observation: 'The same ₹100 is added each year — that\'s why it\'s called SIMPLE interest.',
        highlightFormula: 'Interest per year = P × R',
      },
      {
        id: 3,
        title: 'Time multiplies the interest',
        explanation: 'After T years, you\'ve earned that annual interest T times. So total interest = P × R × T.',
        analogy: 'If you earn ₹100/month for 12 months, you earned ₹1200. Same principle!',
        observation: 'Simple interest grows in a straight line. This is different from compound interest which curves upward.',
        highlightFormula: 'I = P × R × T',
      },
      {
        id: 4,
        title: 'Adjust the sliders',
        explanation: 'Change Principal, Rate, and Time. Watch the bars grow in real time and see how each variable affects the total interest.',
        analogy: 'Banks and loan companies use this exact formula when calculating your EMIs.',
        observation: 'Doubling the time doubles the interest. Doubling the rate also doubles it. They have equal power!',
        highlightFormula: 'I = P × R × T',
      },
    ],
  },
  {
    id: 'ohms-law',
    title: "Ohm's Law",
    subject: 'Physics',
    difficulty: 'Beginner',
    description: 'See electric current as water flow, making voltage, resistance, and current tangible.',
    icon: 'Ω',
    color: 'rose',
    accentColor: '#FF6B8A',
    formula: 'V = I × R',
    steps: [
      {
        id: 1,
        title: 'Think of water flowing',
        explanation: 'Electric current is like water flowing through a pipe. Voltage is like water pressure. Resistance is like a narrow section in the pipe.',
        analogy: 'More pressure → more water flow. Narrower pipe → less water flow. Electricity works exactly the same way.',
        observation: 'Georg Simon Ohm discovered this relationship in 1827 using simple experiments.',
      },
      {
        id: 2,
        title: 'Increase the voltage',
        explanation: 'Higher voltage (pressure) pushes more electrons through the wire. Watch the current arrows speed up as you raise the voltage.',
        analogy: 'Squeezing a water pipe harder makes water come out faster.',
        observation: 'Current is directly proportional to voltage — double the voltage, double the current.',
        highlightFormula: 'I = V ÷ R',
      },
      {
        id: 3,
        title: 'Add resistance',
        explanation: 'Resistance opposes the flow of current. A higher resistance means fewer electrons can flow through, so current decreases.',
        analogy: 'A narrow pipe resists water flow. A wide pipe allows more flow. Resistors are the narrow pipes of electronics.',
        observation: 'Current is inversely proportional to resistance — double the resistance, halve the current.',
      },
      {
        id: 4,
        title: 'The balance: V = I × R',
        explanation: 'Voltage, Current, and Resistance are linked: V = I × R. Knowing any two, you can always find the third.',
        analogy: 'It\'s like speed = distance ÷ time. Once you know two values, the third is determined.',
        observation: 'This single equation powers all of electronics — from your phone to power grids!',
        highlightFormula: 'V = I × R',
      },
      {
        id: 5,
        title: 'Experiment with the circuit',
        explanation: 'Slide the Voltage and Resistance controls. Watch the current change and the flow animation speed up or slow down.',
        analogy: 'LED brightness depends on current — adjust voltage or resistance to control brightness.',
        observation: 'Real engineers use V=IR hundreds of times a day when designing circuits.',
        highlightFormula: 'V = I × R',
      },
    ],
  },
];

export const getConceptById = (id: string): Concept | undefined =>
  CONCEPTS.find((c) => c.id === id);
