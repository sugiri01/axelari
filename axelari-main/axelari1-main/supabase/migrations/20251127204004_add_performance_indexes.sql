/*
  # Add Performance Indexes

  1. Performance Improvements
    - Add indexes on frequently queried columns
    - Optimize foreign key lookups
    - Speed up dashboard queries
  
  2. Indexes Added
    - student_progress: student_id + mastery_level for sorting
    - performance_metrics: student_id + date for time series queries
    - class_assignments: teacher_id + active for class lookups
    - quiz_sessions: student_id + created_at for recent activity
    - parent_child_links: parent_id + active for parent dashboards
    - learning_paths: student_id for quick path lookups
*/

CREATE INDEX IF NOT EXISTS idx_student_progress_student_mastery 
  ON student_progress(student_id, mastery_level DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_student_date 
  ON performance_metrics(student_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_class_assignments_teacher_active 
  ON class_assignments(teacher_id, active);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student_created 
  ON quiz_sessions(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_parent_child_links_parent_active 
  ON parent_child_links(parent_id, active);

CREATE INDEX IF NOT EXISTS idx_learning_paths_student 
  ON learning_paths(student_id);

CREATE INDEX IF NOT EXISTS idx_cognitive_assessments_student 
  ON cognitive_assessments(student_id);
