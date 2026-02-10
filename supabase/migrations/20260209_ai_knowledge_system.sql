-- 🧠 AI ASSISTANT KNOWLEDGE SYSTEM
-- Objective: Store and query knowledge for the Student Assistant AI.

-- 1. Enable pgvector if available (for future RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Knowledge Table
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    source_type text CHECK (source_type IN ('pdf', 'transcript', 'faq', 'policy')),
    metadata jsonb DEFAULT '{}',
    embedding vector(1536), -- Standard OpenAI embedding size
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. AI Usage Logging (For monitoring)
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    prompt text NOT NULL,
    response text NOT NULL,
    tokens_used int,
    context_metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- 4. RLS Policies
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Admins can manage knowledge
CREATE POLICY "Admins full access ai_knowledge" 
ON public.ai_knowledge FOR ALL TO authenticated
USING (public.check_is_admin());

-- Students can read knowledge (Edge functions will actually use it, but good to have)
CREATE POLICY "Students can read knowledge"
ON public.ai_knowledge FOR SELECT TO authenticated
USING (true);

-- Students can view their own interactions
CREATE POLICY "Students view own ai_interactions"
ON public.ai_interactions FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 5. Audit Logging for Interactions
CREATE OR REPLACE FUNCTION public.log_ai_interaction()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        NEW.user_id,
        'student',
        'ai_query',
        'ai_interaction',
        NEW.id::text,
        jsonb_build_object('tokens', NEW.tokens_used)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_ai_interaction
AFTER INSERT ON public.ai_interactions
FOR EACH ROW EXECUTE FUNCTION public.log_ai_interaction();
