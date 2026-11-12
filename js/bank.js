// Topic catalogue and helpers used by the question files in js/questions/.
// Each question file calls DAY1_BANK.add(topicId, [...]) with the helpers below.
//
//   mc(sub, question, [correct, wrong, wrong, wrong], explanation, extra)
//   tf(sub, statement, true|false, explanation, extra)
//   fill(sub, 'Text with ___ blank', answer, [distractors], explanation, extra)
//   match(sub, prompt, [[term, definition], ...], explanation, extra)
//   order(sub, prompt, [items in the correct order], explanation, extra)
//   input(sub, prompt, [accepted answers], explanation, extra)   — typed answer
//
// `extra` is optional: { code: 'snippet', hl: true }. Use the HL constant for HL-only content.
// Typed answers also accept { unit: 'KiB', tol: 1, numeric: true } (tol = accepted numeric margin).
//
// Extra modules live apart from the main bank (they never appear in the daily challenge or the
// practice modes). Register one with addModule({ id, title, tag, description, sections: [...] }),
// where each section is { id, name, questions: [...] }.
(function () {
  const UNITS = [
    { id: 'A1', name: 'Computer Fundamentals' },
    { id: 'A2', name: 'Networks' },
    { id: 'A3', name: 'Databases' },
    { id: 'B1', name: 'Computational Thinking' },
    { id: 'B2', name: 'Programming' },
  ];

  const TOPICS = [
    { id: 'A1.1', unit: 'A1', name: 'Computer Hardware and Operation' },
    { id: 'A1.2', unit: 'A1', name: 'Data Representation and Computer Logic' },
    { id: 'A1.3', unit: 'A1', name: 'Operating Systems and Control Systems' },
    { id: 'A1.4', unit: 'A1', name: 'Translation' },
    { id: 'A2.1', unit: 'A2', name: 'Network Fundamentals' },
    { id: 'A2.2', unit: 'A2', name: 'Network Architecture' },
    { id: 'A2.3', unit: 'A2', name: 'Data Transmission' },
    { id: 'A3.1', unit: 'A3', name: 'Database Fundamentals' },
    { id: 'A3.2', unit: 'A3', name: 'Database Design' },
    { id: 'A3.3', unit: 'A3', name: 'Database Programming' },
    { id: 'A3.4', unit: 'A3', name: 'Alternative Databases and Data Warehouses', hl: true },
    { id: 'B1.1', unit: 'B1', name: 'Approaches to Computational Thinking' },
    { id: 'B2.1', unit: 'B2', name: 'Programming Fundamentals' },
    { id: 'B2.2', unit: 'B2', name: 'Data Structures' },
    { id: 'B2.4', unit: 'B2', name: 'Programming Algorithms' },
  ];

  const byId = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const questions = [];

  function add(topic, list) {
    const meta = byId[topic];
    if (!meta) throw new Error('Unknown topic ' + topic);
    list.forEach((q, i) => {
      q.topic = topic;
      q.id = topic + '#' + (i + 1);
      if (meta.hl) q.hl = true;
      questions.push(q);
    });
  }

  const MODULES = [];

  function addModule(mod) {
    mod.sections.forEach((s) => {
      s.questions.forEach((q, i) => {
        q.topic = s.id;
        q.module = mod.id;
        q.id = s.id + '#' + (i + 1);
      });
    });
    MODULES.push(mod);
  }

  const mc = (sub, q, options, explain, extra) => ({ type: 'mc', sub, q, options, explain, ...extra });
  const tf = (sub, q, answer, explain, extra) => ({ type: 'tf', sub, q, answer, explain, ...extra });
  const fill = (sub, q, answer, distractors, explain, extra) => ({ type: 'fill', sub, q, answer, distractors, explain, ...extra });
  const match = (sub, q, pairs, explain, extra) => ({ type: 'match', sub, q, pairs, explain, ...extra });
  const order = (sub, q, items, explain, extra) => ({ type: 'order', sub, q, items, explain, ...extra });
  const input = (sub, q, accepted, explain, extra) => ({ type: 'input', sub, q, accepted, explain, ...extra });

  window.DAY1_BANK = {
    UNITS, TOPICS, MODULES, questions, add, addModule, mc, tf, fill, match, order, input, HL: { hl: true },
  };
})();
