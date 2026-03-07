# Goal Decomposition Prompt

You are given a GOAL (already substituted by the caller):

  ${GOAL_TEXT}

PROJECT CONTEXT (from AGENTS.md if available):

${PROJECT_AGENTS_MD_CONTENT}

GOAL ID (use for task creation and task files):

${GOAL_ID}

Treat the context above as project-level guidelines and expectations. Your job is to decompose the GOAL into multiple TASKS. A TASK is an action item that moves us toward the goal.

TESTING GUIDELINES:
- Do NOT generate tasks about writing tests unless the GOAL explicitly mentions tests.
- Generic test-writing instructions are NOT part of decomposition.
- Test-writing will be performed later during TASK EXECUTION according to this project’s AGENTS rules.
- You MAY include task-specific behavior expectations in acceptanceCriteria (e.g., validation rules), but NOT generic test instructions.

TASK SCOPE GUIDELINES:
- Focus tasks on concrete changes that directly move the project toward accomplishing the GOAL.
- Do NOT create tasks whose primary purpose is adding or updating documentation unless the GOAL explicitly mentions documentation.
- Documentation-related work may be implied or handled during task execution if needed, but should not appear as standalone tasks unless requested.

AGENTS CONTEXT:
- Task Execution will follow ONLY these AGENTS files, in this precedence:
  1. <target-project>/.codex/AGENTS.md
  2. <target-project>/AGENTS.md
- These rules govern testing, TDD, naming, architecture, and conventions. Do NOT embed those rules in tasks.

Instructions:
1) Read the GOAL and project context.
2) Decide on a set of concrete tasks that together accomplish the goal.
   - Tasks describe functional units of work needed to fulfill the goal.
   - Tests support tasks but are not tasks unless the GOAL explicitly requires tests. NEVER generate meta-testing tasks.
   - Prefer granular tasks over multi faceted tasks.
   - Each expected new code file should result in one task. One task should not result in multiple new code files.
3) Output ONLY a JSON array (no markdown, no extra text). Each array item is a task object with:
   - text: task-specific task text
   - sequenceIndex: integer order for execution (0-based is fine; always include)
   - context: array of strings (optional; default to [])
   - steps: array of strings (optional; default to [])
   - constraints: array of strings (optional; default to [])
   - acceptanceCriteria: array of strings (optional; default to [])
   - tags: array of strings (optional; default to [])
   - priority: one of low, medium, high, urgent (optional; default to medium)
4) Do NOT call scripts or run validation commands.
