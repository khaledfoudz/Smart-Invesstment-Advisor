-- ==========================================
-- USERS TABLE
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS users_userId_seq;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_userId_seq'::regclass),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- ==========================================
-- INVESTMENTS TABLE
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS investment_investmentid_seq;

CREATE TABLE IF NOT EXISTS public.investments
(
    "investmentId" integer NOT NULL DEFAULT nextval('investment_investmentid_seq'::regclass),
    investmentname text NOT NULL,
    investmentrisk text NOT NULL,
    investment_capital numeric NOT NULL,
    investment_horizon text NOT NULL,
    expectedreturn numeric NOT NULL,
    CONSTRAINT investment_pkey PRIMARY KEY ("investmentId")
);

-- ==========================================
-- QUESTIONNAIRE TABLE
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS questionnaire_answersid_seq;

CREATE TABLE IF NOT EXISTS public.questionnaire
(
    answersid integer NOT NULL DEFAULT nextval('questionnaire_answersid_seq'::regclass),
    user_id integer NOT NULL,
    age integer NOT NULL,
    occupation text NOT NULL,
    location text,
    monthly_income numeric NOT NULL,
    current_savings numeric NOT NULL,
    monthly_expenses numeric NOT NULL,
    existing_investments text,
    investment_objective text NOT NULL,
    investment_goal_description text,
    investment_horizon text NOT NULL,
    risk_tolerance text NOT NULL,
    risk_reaction text NOT NULL,
    created_at timestamp DEFAULT now(),

    CONSTRAINT questionnaire_pkey PRIMARY KEY (answersid),
    CONSTRAINT questionnaire_user_unique UNIQUE (user_id),

    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE
);

-- ==========================================
-- RESULTS TABLE
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS results_resultsid_seq;

CREATE TABLE IF NOT EXISTS public.results
(
    resultsid integer NOT NULL DEFAULT nextval('results_resultsid_seq'::regclass),
    resultsdate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    investmentid integer NOT NULL,
    userid integer NOT NULL,
    answersid integer NOT NULL,
    confidencescore numeric NOT NULL,

    CONSTRAINT results_pkey PRIMARY KEY (resultsid),

    CONSTRAINT results_investmentid_fkey FOREIGN KEY (investmentid)
        REFERENCES public.investments ("investmentId")
        ON DELETE CASCADE,

    CONSTRAINT results_userid_fkey FOREIGN KEY (userid)
        REFERENCES public.users (id)
        ON DELETE CASCADE,

    CONSTRAINT results_answersid_fkey FOREIGN KEY (answersid)
        REFERENCES public.questionnaire (answersid)
        ON DELETE CASCADE
);