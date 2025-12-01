-- Seed Data Script for Axelari Platform Demo
-- Run this to populate the database with sample data

-- Get course IDs (adjust these after running the initial insert)
DO $$
DECLARE
  math10_id uuid;
  math11_id uuid;
  phys10_id uuid;
BEGIN
  -- Get course IDs
  SELECT id INTO math10_id FROM courses WHERE title = 'Mathematics - Class 10' LIMIT 1;
  SELECT id INTO math11_id FROM courses WHERE title = 'Mathematics - Class 11' LIMIT 1;
  SELECT id INTO phys10_id FROM courses WHERE title = 'Physics - Class 10' LIMIT 1;

  -- Insert Topics for Math 10
  INSERT INTO topics (course_id, title, description, difficulty, order_index, estimated_time) VALUES
    (math10_id, 'Real Numbers', 'Fundamental concepts of real numbers including rational and irrational numbers', 'beginner', 1, 45),
    (math10_id, 'Polynomials', 'Understanding polynomials, their degrees, and basic operations', 'beginner', 2, 50),
    (math10_id, 'Linear Equations', 'Solving linear equations in two variables and their applications', 'intermediate', 3, 40),
    (math10_id, 'Quadratic Equations', 'Understanding and solving quadratic equations using various methods', 'intermediate', 4, 55),
    (math10_id, 'Trigonometry', 'Introduction to trigonometric ratios and their applications', 'advanced', 5, 60);

  -- Insert Topics for Math 11
  INSERT INTO topics (course_id, title, description, difficulty, order_index, estimated_time) VALUES
    (math11_id, 'Sets and Functions', 'Understanding sets, relations, and functions', 'intermediate', 1, 45),
    (math11_id, 'Trigonometric Functions', 'Advanced trigonometry including inverse functions', 'intermediate', 2, 50),
    (math11_id, 'Limits and Derivatives', 'Introduction to calculus - limits and basic derivatives', 'advanced', 3, 65),
    (math11_id, 'Sequences and Series', 'Arithmetic and geometric progressions', 'intermediate', 4, 50),
    (math11_id, 'Permutations and Combinations', 'Fundamental principles of counting', 'advanced', 5, 55);

  -- Insert Topics for Physics 10
  INSERT INTO topics (course_id, title, description, difficulty, order_index, estimated_time) VALUES
    (phys10_id, 'Light - Reflection and Refraction', 'Understanding light behavior and optical phenomena', 'intermediate', 1, 50),
    (phys10_id, 'Electricity', 'Electric current, potential difference, and resistance', 'intermediate', 2, 55),
    (phys10_id, 'Magnetic Effects of Electric Current', 'Understanding electromagnets and electric motors', 'advanced', 3, 60),
    (phys10_id, 'Human Eye and Colourful World', 'Structure of eye and atmospheric refraction', 'beginner', 4, 40),
    (phys10_id, 'Sources of Energy', 'Conventional and non-conventional energy sources', 'beginner', 5, 45);

END $$;

-- Now insert questions for each topic
DO $$
DECLARE
  topic_id uuid;
BEGIN
  -- Real Numbers Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Real Numbers' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'Which of the following is an irrational number?', 'mcq', '["√16", "√2", "22/7", "3.14"]'::jsonb, '√2', 'The square root of 2 cannot be expressed as a fraction of two integers, making it irrational. √16 = 4 which is rational.', 'easy', 'remember'),
    (topic_id, 'The decimal expansion of the rational number 14587/1250 will terminate after how many decimal places?', 'mcq', '["1", "2", "3", "4"]'::jsonb, '4', 'The denominator 1250 = 2 × 5⁴. Since it can be expressed as 2^m × 5^n, the decimal terminates after max(m,n) = 4 places.', 'medium', 'apply'),
    (topic_id, 'What is the HCF of 96 and 404?', 'mcq', '["4", "8", "12", "2"]'::jsonb, '4', 'Using Euclid''s division algorithm: 404 = 96 × 4 + 20, 96 = 20 × 4 + 16, 20 = 16 × 1 + 4, 16 = 4 × 4 + 0. HCF is 4.', 'medium', 'apply'),
    (topic_id, 'If two positive integers a and b are written as a = x³y² and b = xy³, then HCF(a,b) is:', 'mcq', '["xy²", "xy³", "x³y³", "x²y²"]'::jsonb, 'xy²', 'HCF is the product of smallest powers of common factors. Here x appears as x¹ and x³, y appears as y² and y³. So HCF = x¹y² = xy².', 'hard', 'analyze');

  -- Polynomials Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Polynomials' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The degree of the polynomial 4x⁴ + 0x³ + 0x⁵ + 5x + 7 is:', 'mcq', '["4", "5", "3", "7"]'::jsonb, '5', 'The degree of a polynomial is the highest power of the variable. Here the highest power is 5 (from the term 0x⁵).', 'easy', 'remember'),
    (topic_id, 'If one zero of the polynomial x² - 4x + 1 is 2 + √3, what is the other zero?', 'mcq', '["2 - √3", "-2 + √3", "-2 - √3", "√3"]'::jsonb, '2 - √3', 'For a quadratic ax² + bx + c, sum of zeros = -b/a = 4. If one zero is 2 + √3, the other is 4 - (2 + √3) = 2 - √3.', 'medium', 'apply'),
    (topic_id, 'A quadratic polynomial whose zeroes are -3 and 4 is:', 'mcq', '["x² - x + 12", "x² + x - 12", "x² - x - 12", "x² + x + 12"]'::jsonb, 'x² - x - 12', 'If α and β are zeros, the polynomial is k(x - α)(x - β) = k(x + 3)(x - 4) = k(x² - x - 12). Taking k = 1, we get x² - x - 12.', 'hard', 'create');

  -- Linear Equations Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Linear Equations' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The pair of equations x + 2y = 5 and 3x + 6y = 15 has:', 'mcq', '["A unique solution", "No solution", "Infinitely many solutions", "Only two solutions"]'::jsonb, 'Infinitely many solutions', 'The equations are equivalent (second is 3 times first). They represent the same line, so there are infinitely many solutions.', 'medium', 'understand'),
    (topic_id, 'If 2x + 3y = 12 and x - y = 1, what is the value of x?', 'mcq', '["3", "4", "2", "5"]'::jsonb, '3', 'From x - y = 1, we get x = y + 1. Substituting in 2x + 3y = 12: 2(y+1) + 3y = 12, 5y = 10, y = 2. So x = 3.', 'medium', 'apply');

  -- Quadratic Equations Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Quadratic Equations' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The roots of the equation x² - 3x + 2 = 0 are:', 'mcq', '["1, 2", "2, 3", "-1, -2", "1, -2"]'::jsonb, '1, 2', 'Factoring: x² - 3x + 2 = (x - 1)(x - 2) = 0. Therefore, x = 1 or x = 2.', 'easy', 'apply'),
    (topic_id, 'The discriminant of the quadratic equation 2x² + 5x - 3 = 0 is:', 'mcq', '["49", "36", "25", "1"]'::jsonb, '49', 'Discriminant D = b² - 4ac = 5² - 4(2)(-3) = 25 + 24 = 49.', 'medium', 'apply'),
    (topic_id, 'For what value of k does the equation kx² + 4x + 1 = 0 have real and equal roots?', 'mcq', '["4", "2", "1", "3"]'::jsonb, '4', 'For equal roots, discriminant = 0. So 4² - 4(k)(1) = 0, which gives 16 - 4k = 0, thus k = 4.', 'hard', 'analyze');

  -- Trigonometry Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Trigonometry' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The value of sin 30° is:', 'mcq', '["1/2", "√3/2", "1/√2", "1"]'::jsonb, '1/2', 'This is a standard trigonometric value. sin 30° = 1/2.', 'easy', 'remember'),
    (topic_id, 'If sin θ = 3/5, what is the value of cos θ?', 'mcq', '["4/5", "3/4", "5/3", "2/5"]'::jsonb, '4/5', 'Using the identity sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1, so cos²θ = 1 - 9/25 = 16/25. Thus cos θ = 4/5.', 'medium', 'apply'),
    (topic_id, 'The value of (sin 45° + cos 45°)² is:', 'mcq', '["1", "√2", "2", "1/2"]'::jsonb, '2', 'sin 45° = cos 45° = 1/√2. So (1/√2 + 1/√2)² = (2/√2)² = (√2)² = 2.', 'hard', 'evaluate');

  -- Sets and Functions Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Sets and Functions' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∩ B?', 'mcq', '["{3}", "{1, 2, 3, 4, 5}", "{1, 2}", "∅"]'::jsonb, '{3}', 'The intersection of two sets contains only the elements common to both sets. Only 3 is present in both A and B.', 'easy', 'understand'),
    (topic_id, 'Which of the following represents a function?', 'mcq', '["{(1,2), (2,3), (1,4)}", "{(1,2), (2,2), (3,2)}", "{(1,2), (2,3), (3,4), (2,5)}", "None"]'::jsonb, '{(1,2), (2,2), (3,2)}', 'A function must have exactly one output for each input. Only this option satisfies that condition.', 'medium', 'understand');

  -- Limits and Derivatives Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Limits and Derivatives' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The limit of (x² - 4)/(x - 2) as x approaches 2 is:', 'mcq', '["4", "2", "0", "Does not exist"]'::jsonb, '4', 'Factoring the numerator: (x² - 4)/(x - 2) = (x + 2)(x - 2)/(x - 2) = x + 2. As x → 2, the limit is 2 + 2 = 4.', 'medium', 'apply'),
    (topic_id, 'The derivative of x³ with respect to x is:', 'mcq', '["3x²", "x²", "3x", "x⁴/4"]'::jsonb, '3x²', 'Using the power rule: d/dx(x^n) = nx^(n-1), so d/dx(x³) = 3x².', 'easy', 'remember');

  -- Physics - Light Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Light - Reflection and Refraction' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The refractive index of glass with respect to air is 1.5. What is the refractive index of air with respect to glass?', 'mcq', '["1.5", "0.67", "2.25", "1"]'::jsonb, '0.67', 'The refractive index of medium 1 w.r.t. medium 2 is the reciprocal of medium 2 w.r.t. medium 1. So 1/1.5 ≈ 0.67.', 'medium', 'apply'),
    (topic_id, 'A light ray enters from air to water. What happens to its speed?', 'mcq', '["Increases", "Decreases", "Remains same", "Becomes zero"]'::jsonb, 'Decreases', 'Light travels slower in denser mediums. Water is denser than air, so speed decreases.', 'easy', 'understand');

  -- Physics - Electricity Questions
  SELECT id INTO topic_id FROM topics WHERE title = 'Electricity' LIMIT 1;

  INSERT INTO questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, bloom_level) VALUES
    (topic_id, 'The resistance of a wire is 10Ω. If it is stretched to double its length, what will be its new resistance?', 'mcq', '["20Ω", "40Ω", "10Ω", "5Ω"]'::jsonb, '40Ω', 'Resistance R = ρl/A. When length doubles, area becomes half (volume constant). So new R = ρ(2l)/(A/2) = 4ρl/A = 4R = 40Ω.', 'hard', 'analyze'),
    (topic_id, 'The SI unit of electric current is:', 'mcq', '["Ampere", "Volt", "Ohm", "Watt"]'::jsonb, 'Ampere', 'Ampere (A) is the SI unit of electric current.', 'easy', 'remember');

END $$;

-- Insert Content Library items
DO $$
DECLARE
  topic_id uuid;
BEGIN
  SELECT id INTO topic_id FROM topics WHERE title = 'Real Numbers' LIMIT 1;
  INSERT INTO content_library (topic_id, title, content_type, content_url, description, duration, difficulty, learning_style) VALUES
    (topic_id, 'Introduction to Real Numbers', 'video', 'https://www.youtube.com/watch?v=example1', 'Comprehensive introduction to real numbers with examples', 25, 'beginner', ARRAY['visual', 'verbal']);

  SELECT id INTO topic_id FROM topics WHERE title = 'Polynomials' LIMIT 1;
  INSERT INTO content_library (topic_id, title, content_type, content_url, description, duration, difficulty, learning_style) VALUES
    (topic_id, 'Polynomials Explained', 'document', 'https://example.com/polynomials.pdf', 'Detailed notes on polynomial operations', 30, 'beginner', ARRAY['verbal', 'logical']);

  SELECT id INTO topic_id FROM topics WHERE title = 'Linear Equations' LIMIT 1;
  INSERT INTO content_library (topic_id, title, content_type, content_url, description, duration, difficulty, learning_style) VALUES
    (topic_id, 'Linear Equations Practice', 'interactive', 'https://example.com/linear-practice', 'Interactive problem-solving for linear equations', 35, 'intermediate', ARRAY['kinesthetic', 'logical']);

  SELECT id INTO topic_id FROM topics WHERE title = 'Quadratic Equations' LIMIT 1;
  INSERT INTO content_library (topic_id, title, content_type, content_url, description, duration, difficulty, learning_style) VALUES
    (topic_id, 'Quadratic Equations Masterclass', 'video', 'https://www.youtube.com/watch?v=example2', 'Step-by-step solutions to quadratic problems', 40, 'intermediate', ARRAY['visual', 'logical']);

  SELECT id INTO topic_id FROM topics WHERE title = 'Trigonometry' LIMIT 1;
  INSERT INTO content_library (topic_id, title, content_type, content_url, description, duration, difficulty, learning_style) VALUES
    (topic_id, 'Trigonometry Visualization', 'simulation', 'https://example.com/trig-sim', 'Interactive unit circle and trigonometric ratios', 45, 'advanced', ARRAY['visual', 'kinesthetic']);

END $$;
