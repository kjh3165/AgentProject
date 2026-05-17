-- Enable Realtime for transactions and categories
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table categories;
