export const CATEGORIES = ['IT & Network', 'Electrical', 'Plumbing', 'Classroom', 'Housekeeping', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved'];
export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function requiredText(value, name, min = 1, max = 200) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new ApiError(400, `${name} must be ${min}–${max} characters.`);
  return value.trim();
}
export function choice(value, values, name) {
  if (!values.includes(value)) throw new ApiError(400, `Choose a valid ${name}.`);
  return value;
}
export function validateComplaint(data) {
  return {
    title: requiredText(data.title, 'Title', 5, 120), description: requiredText(data.description, 'Description', 15, 3000),
    location: requiredText(data.location, 'Location', 3, 120), category: choice(data.category, CATEGORIES, 'category'),
    priority: choice(data.priority, PRIORITIES, 'priority'),
  };
}
export function validateRegistration(data) {
  const email = requiredText(data.email, 'Email', 5, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Enter a valid email address.');
  if (email.endsWith('@campus.demo')) throw new ApiError(400, 'The campus.demo domain is reserved for demo accounts.');
  const password = requiredText(data.password, 'Password', 10, 128);
  return { name: requiredText(data.name, 'Name', 2, 80), email, password,
    department: requiredText(data.department, 'Department', 2, 80) };
}
export function canView(user, complaint) {
  return user.role === 'admin' || (user.role === 'student' && complaint.student_id === user.id)
    || (user.role === 'staff' && complaint.assignee_id === user.id);
}
export function nextStatuses(status) {
  return ({ Open: [], Assigned: ['In Progress'], 'In Progress': ['Resolved'], Resolved: ['In Progress'] })[status] || [];
}
export function checkTransition(from, to) {
  choice(to, STATUSES, 'status');
  if (!nextStatuses(from).includes(to)) throw new ApiError(400, `Cannot move a complaint from ${from} to ${to}.`);
}
