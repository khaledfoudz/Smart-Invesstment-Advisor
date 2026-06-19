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
    "investmentId"     integer NOT NULL DEFAULT nextval('investment_investmentid_seq'::regclass),
    investmentname     text    NOT NULL,
    investmentrisk     text    NOT NULL,
    investment_capital numeric NOT NULL,
    investment_horizon text    NOT NULL,
    expectedreturn     numeric NOT NULL,
    investment_type    text,
    description        text,
    CONSTRAINT investment_pkey PRIMARY KEY ("investmentId")
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert Egyptian market investments
INSERT INTO public.investments 
  (investmentname, investmentrisk, investment_capital, investment_horizon, expectedreturn, investment_type, description) 
VALUES
-- Low Risk
('Egyptian T-Bills (91/182/364 days)',
 'Low', 1000, 'Short', 22.0, 'Bonds',
 'Treasury bills issued by the Egyptian government. Currently one of the highest risk-free returns available — backed by the state so your capital is fully protected. Ideal if you want strong returns without any market exposure.'),

('Egyptian Government Bonds (3–10 yr)',
 'Low', 5000, 'Long', 19.5, 'Bonds',
 'Long-term bonds from the Egyptian Ministry of Finance. Lock in today''s high interest rates before they decline. Pays a fixed coupon every 6 months and returns your full principal at maturity.'),

('Bank Certificate of Deposit (CIB / NBE)',
 'Low', 1000, 'Medium', 21.0, 'Savings',
 'Fixed-term deposit certificates from Egypt''s largest banks — NBE and CIB. Currently offering 20–23% annually in EGP. Zero market risk — your principal is fully guaranteed and protected under Egyptian deposit insurance.'),

('Money Market Fund — Egypt',
 'Low', 500, 'Short', 18.5, 'Money Market',
 'A managed fund investing in short-term government securities and bank deposits. Highly liquid — withdraw any business day. Perfect as an emergency fund or cash parking place while earning far more than a savings account.'),

-- Medium Risk
('EGX30 Blue Chip Stocks',
 'Medium', 5000, 'Medium', 25.0, 'Stock market',
 'Shares in Egypt''s 30 largest listed companies — CIB, Talaat Moustafa, Eastern Company and others. Proven track records, regular dividends, and strong liquidity. Balances growth potential with relative stability compared to smaller companies.'),

('EGX30 Index Fund',
 'Medium', 2000, 'Long', 22.0, 'Index ETF',
 'A fund that tracks all 30 top Egyptian listed companies at once. Instead of picking individual stocks you own a slice of all of them — built-in diversification. Historically beats inflation significantly over 5+ year periods.'),

('Corporate Bonds — Egyptian Blue Chips',
 'Medium', 10000, 'Medium', 16.0, 'Bonds',
 'Bonds issued by large Egyptian corporations like Orascom, Edita, and Ezz Steel. Higher returns than government bonds in exchange for modest additional risk. You lend money to the company; it pays you interest and returns your principal at maturity.'),

('Real Estate Investment Trust (REIT)',
 'Medium', 3000, 'Long', 18.0, 'Real Estate',
 'A fund owning income-generating Egyptian properties — offices, malls, and residential compounds. You get property appreciation and rental income without buying physical real estate. Newly introduced in Egypt following updated financial regulations.'),

('Gold — Physical or ETF',
 'Medium', 2000, 'Long', 15.0, 'Commodities',
 'Gold physically or through a gold-backed fund. Egypt''s traditional hedge against inflation and EGP devaluation. When the pound weakens, gold priced in USD rises — preserving your purchasing power. Recommended as 10–20% of a balanced portfolio.'),

-- High Risk
('EGX Small & Mid Cap Growth Stocks',
 'High', 10000, 'Long', 35.0, 'Stock market',
 'Shares in smaller, faster-growing Egyptian companies outside the EGX30. Higher return potential but prices can swing 30–50% in downturns. Requires a 5+ year horizon and the discipline to not panic-sell. Not suitable for money you may need soon.'),

('USD / Foreign Currency Deposits',
 'High', 5000, 'Medium', 20.0, 'Forex',
 'Holding deposits in US Dollars or Euros in an Egyptian bank. Protects against EGP devaluation — if the pound weakens further your savings in USD are worth more in local terms. Returns depend on both the foreign interest rate and exchange rate movements.'),

('Cryptocurrency Portfolio',
 'High', 1000, 'Short', 40.0, 'Crypto',
 'Digital currencies like Bitcoin and Ethereum. Extremely volatile — can gain or lose 50%+ in a single month. Exists in a regulatory grey area in Egypt. Only invest what you can afford to lose entirely. Best for investors with deep knowledge of the space and a high risk appetite.');
-- ==========================================
-- QUESTIONNAIRE TABLE
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS questionnaire_answersid_seq;

CREATE TABLE IF NOT EXISTS public.questionnaire
(
    answersid                   integer   NOT NULL DEFAULT nextval('questionnaire_answersid_seq'::regclass),
    user_id                     integer   NOT NULL,
    age                         integer   NOT NULL,
    occupation                  text      NOT NULL,
    location                    text,
    monthly_income              numeric   NOT NULL,
    current_savings             numeric   NOT NULL,
    monthly_expenses            numeric   NOT NULL,
    existing_investments        text,
    investment_objective        text      NOT NULL,
    investment_goal_description text,
    investment_horizon          text      NOT NULL,
    risk_tolerance              text      NOT NULL,
    risk_reaction               text      NOT NULL,
    created_at                  timestamp DEFAULT now(),

    CONSTRAINT questionnaire_pkey       PRIMARY KEY (answersid),
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
    resultsid            integer   NOT NULL DEFAULT nextval('results_resultsid_seq'::regclass),
    resultsdate          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userid               integer   NOT NULL,
    answersid            integer   NOT NULL,
    recommendation_text  text,
    is_current           boolean   NOT NULL DEFAULT true,

    CONSTRAINT results_pkey PRIMARY KEY (resultsid),

    CONSTRAINT results_userid_fkey FOREIGN KEY (userid)
        REFERENCES public.users (id)
        ON DELETE CASCADE,

    CONSTRAINT results_answersid_fkey FOREIGN KEY (answersid)
        REFERENCES public.questionnaire (answersid)
        ON DELETE CASCADE
);