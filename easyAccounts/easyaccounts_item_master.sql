--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: accounts_ledger; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE accounts_ledger (
    id integer NOT NULL,
    parent_id integer,
    name character varying(200),
    description character varying(200),
    balance numeric(20,5) DEFAULT 0.00000 NOT NULL,
    account_code character varying(200)
);


ALTER TABLE public.accounts_ledger OWNER TO remya;

--
-- Name: accounts_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE accounts_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_ledger_id_seq OWNER TO remya;

--
-- Name: accounts_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE accounts_ledger_id_seq OWNED BY accounts_ledger.id;


--
-- Name: accounts_ledgerentry; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE accounts_ledgerentry (
    id integer NOT NULL,
    ledger_id integer NOT NULL,
    credit_amount numeric(14,2),
    debit_amount numeric(14,2),
    date date,
    transaction_reference_number character varying(200)
);


ALTER TABLE public.accounts_ledgerentry OWNER TO remya;

--
-- Name: accounts_ledgerentry_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE accounts_ledgerentry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_ledgerentry_id_seq OWNER TO remya;

--
-- Name: accounts_ledgerentry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE accounts_ledgerentry_id_seq OWNED BY accounts_ledgerentry.id;


--
-- Name: accounts_transaction; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE accounts_transaction (
    id integer NOT NULL,
    transaction_ref character varying(200),
    debit_ledger_id integer,
    credit_ledger_id integer,
    transaction_date date,
    debit_amount numeric(14,2),
    credit_amount numeric(14,2),
    narration text,
    payment_mode character varying(200) NOT NULL,
    bank_name character varying(200),
    cheque_date date,
    cheque_number character varying(200),
    branch character varying(200),
    card_holder_name character varying(200),
    card_no character varying(200),
    invoice text
);


ALTER TABLE public.accounts_transaction OWNER TO remya;

--
-- Name: accounts_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE accounts_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_transaction_id_seq OWNER TO remya;

--
-- Name: accounts_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE accounts_transaction_id_seq OWNED BY accounts_transaction.id;


--
-- Name: administration_bonuspoint; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE administration_bonuspoint (
    id integer NOT NULL,
    bonus_type character varying(200),
    bonus_point character varying(200),
    bonus_amount numeric(15,2)
);


ALTER TABLE public.administration_bonuspoint OWNER TO remya;

--
-- Name: administration_bonuspoint_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE administration_bonuspoint_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_bonuspoint_id_seq OWNER TO remya;

--
-- Name: administration_bonuspoint_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE administration_bonuspoint_id_seq OWNED BY administration_bonuspoint.id;


--
-- Name: administration_permission; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE administration_permission (
    id integer NOT NULL,
    accounts_permission boolean DEFAULT false NOT NULL,
    inventory_permission boolean DEFAULT false NOT NULL,
    purchase_permission boolean DEFAULT false NOT NULL,
    sales_permission boolean DEFAULT false NOT NULL,
    suppliers boolean DEFAULT false NOT NULL,
    customers boolean DEFAULT false NOT NULL,
    reports boolean NOT NULL
);


ALTER TABLE public.administration_permission OWNER TO remya;

--
-- Name: administration_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE administration_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_permission_id_seq OWNER TO remya;

--
-- Name: administration_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE administration_permission_id_seq OWNED BY administration_permission.id;


--
-- Name: administration_salesman; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE administration_salesman (
    id integer NOT NULL,
    first_name character varying(200),
    last_name character varying(200),
    address text,
    contact_no character varying(15),
    email character varying(200),
    bonus_point numeric(14,2),
    incentive_per_sale numeric(14,2)
);


ALTER TABLE public.administration_salesman OWNER TO remya;

--
-- Name: administration_salesman_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE administration_salesman_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_salesman_id_seq OWNER TO remya;

--
-- Name: administration_salesman_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE administration_salesman_id_seq OWNED BY administration_salesman.id;


--
-- Name: administration_serialnobill; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE administration_serialnobill (
    id integer NOT NULL,
    is_auto_generated boolean DEFAULT false NOT NULL,
    prefix character varying(200),
    user_id integer,
    starting_no numeric(14,2)
);


ALTER TABLE public.administration_serialnobill OWNER TO remya;

--
-- Name: administration_serialnobill_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE administration_serialnobill_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_serialnobill_id_seq OWNER TO remya;

--
-- Name: administration_serialnobill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE administration_serialnobill_id_seq OWNED BY administration_serialnobill.id;


--
-- Name: administration_serialnoinvoice; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE administration_serialnoinvoice (
    id integer NOT NULL,
    is_auto_generated boolean DEFAULT false NOT NULL,
    prefix character varying(200),
    user_id integer,
    starting_no numeric(14,2)
);


ALTER TABLE public.administration_serialnoinvoice OWNER TO remya;

--
-- Name: administration_serialnoinvoice_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE administration_serialnoinvoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_serialnoinvoice_id_seq OWNER TO remya;

--
-- Name: administration_serialnoinvoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE administration_serialnoinvoice_id_seq OWNED BY administration_serialnoinvoice.id;


--
-- Name: administration_staff; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE administration_staff (
    id integer NOT NULL,
    user_id integer,
    designation character varying(200),
    address text,
    contact_no character varying(15),
    permission_id integer
);


ALTER TABLE public.administration_staff OWNER TO remya;

--
-- Name: administration_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE administration_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_staff_id_seq OWNER TO remya;

--
-- Name: administration_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE administration_staff_id_seq OWNED BY administration_staff.id;


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE auth_group (
    id integer NOT NULL,
    name character varying(80) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO remya;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_group_id_seq OWNER TO remya;

--
-- Name: auth_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE auth_group_id_seq OWNED BY auth_group.id;


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE auth_group_permissions (
    id integer NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO remya;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_group_permissions_id_seq OWNER TO remya;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE auth_group_permissions_id_seq OWNED BY auth_group_permissions.id;


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE auth_permission (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO remya;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_permission_id_seq OWNER TO remya;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE auth_permission_id_seq OWNED BY auth_permission.id;


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone NOT NULL,
    is_superuser boolean NOT NULL,
    username character varying(30) NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    email character varying(75) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_user OWNER TO remya;

--
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE auth_user_groups (
    id integer NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO remya;

--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_user_groups_id_seq OWNER TO remya;

--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE auth_user_groups_id_seq OWNED BY auth_user_groups.id;


--
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_user_id_seq OWNER TO remya;

--
-- Name: auth_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE auth_user_id_seq OWNED BY auth_user.id;


--
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE auth_user_user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO remya;

--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_user_user_permissions_id_seq OWNER TO remya;

--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE auth_user_user_permissions_id_seq OWNED BY auth_user_user_permissions.id;


--
-- Name: customers_customer; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE customers_customer (
    id integer NOT NULL,
    ledger_id integer,
    name character varying(200),
    address text,
    email character varying(200),
    bonus_point numeric(14,2),
    contact_number character varying(200),
    area character varying(200)
);


ALTER TABLE public.customers_customer OWNER TO remya;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE customers_customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_customer_id_seq OWNER TO remya;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE customers_customer_id_seq OWNED BY customers_customer.id;


--
-- Name: dashboard_postdatedcheque; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE dashboard_postdatedcheque (
    id integer NOT NULL,
    cheque_date date,
    transaction_ref character varying(150),
    narration text
);


ALTER TABLE public.dashboard_postdatedcheque OWNER TO remya;

--
-- Name: dashboard_postdatedcheque_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE dashboard_postdatedcheque_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dashboard_postdatedcheque_id_seq OWNER TO remya;

--
-- Name: dashboard_postdatedcheque_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE dashboard_postdatedcheque_id_seq OWNED BY dashboard_postdatedcheque.id;


--
-- Name: dashboard_stockquantityalert; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE dashboard_stockquantityalert (
    id integer NOT NULL
);


ALTER TABLE public.dashboard_stockquantityalert OWNER TO remya;

--
-- Name: dashboard_stockquantityalert_batch_items; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE dashboard_stockquantityalert_batch_items (
    id integer NOT NULL,
    stockquantityalert_id integer NOT NULL,
    batchitem_id integer NOT NULL
);


ALTER TABLE public.dashboard_stockquantityalert_batch_items OWNER TO remya;

--
-- Name: dashboard_stockquantityalert_batch_items_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE dashboard_stockquantityalert_batch_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dashboard_stockquantityalert_batch_items_id_seq OWNER TO remya;

--
-- Name: dashboard_stockquantityalert_batch_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE dashboard_stockquantityalert_batch_items_id_seq OWNED BY dashboard_stockquantityalert_batch_items.id;


--
-- Name: dashboard_stockquantityalert_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE dashboard_stockquantityalert_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dashboard_stockquantityalert_id_seq OWNER TO remya;

--
-- Name: dashboard_stockquantityalert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE dashboard_stockquantityalert_id_seq OWNED BY dashboard_stockquantityalert.id;


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    user_id integer NOT NULL,
    content_type_id integer,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO remya;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_admin_log_id_seq OWNER TO remya;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE django_admin_log_id_seq OWNED BY django_admin_log.id;


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE django_content_type (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO remya;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_content_type_id_seq OWNER TO remya;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE django_content_type_id_seq OWNED BY django_content_type.id;


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO remya;

--
-- Name: django_site; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE django_site (
    id integer NOT NULL,
    domain character varying(100) NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.django_site OWNER TO remya;

--
-- Name: django_site_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE django_site_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.django_site_id_seq OWNER TO remya;

--
-- Name: django_site_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE django_site_id_seq OWNED BY django_site.id;


--
-- Name: inventory_batch; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_batch (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    created_date date,
    expiry_date date
);


ALTER TABLE public.inventory_batch OWNER TO remya;

--
-- Name: inventory_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_batch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_batch_id_seq OWNER TO remya;

--
-- Name: inventory_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_batch_id_seq OWNED BY inventory_batch.id;


--
-- Name: inventory_batchitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_batchitem (
    id integer NOT NULL,
    batch_id integer,
    item_id integer,
    purchase_price numeric(50,5) DEFAULT 0.00000 NOT NULL,
    cost_price numeric(50,5) DEFAULT 0.00000 NOT NULL,
    uom character varying(200),
    whole_sale_price numeric(20,5) DEFAULT 0.00000 NOT NULL,
    retail_price numeric(20,5) DEFAULT 0.00000 NOT NULL,
    freight_charge numeric(20,5) DEFAULT 0.00000 NOT NULL,
    salesman_bonus_points_id integer,
    customer_bonus_points_id integer,
    customer_bonus_quantity double precision,
    salesman_bonus_quantity double precision,
    customer_card_price numeric(20,5) NOT NULL,
    whole_sale_profit_percentage numeric(20,5) NOT NULL,
    retail_profit_percentage numeric(20,5) NOT NULL,
    permissible_discount_percentage numeric(20,5) NOT NULL,
    branch_price numeric(20,5) NOT NULL,
    quantity_in_actual_unit double precision NOT NULL,
    small_wholesale_price numeric(50,25) NOT NULL,
    small_retail_price numeric(50,25) NOT NULL,
    small_branch_price numeric(50,25) NOT NULL,
    small_customer_card_price numeric(50,25) NOT NULL
);


ALTER TABLE public.inventory_batchitem OWNER TO remya;

--
-- Name: inventory_batchitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_batchitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_batchitem_id_seq OWNER TO remya;

--
-- Name: inventory_batchitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_batchitem_id_seq OWNED BY inventory_batchitem.id;


--
-- Name: inventory_brand; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_brand (
    id integer NOT NULL,
    name character varying(200)
);


ALTER TABLE public.inventory_brand OWNER TO remya;

--
-- Name: inventory_brand_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_brand_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_brand_id_seq OWNER TO remya;

--
-- Name: inventory_brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_brand_id_seq OWNED BY inventory_brand.id;


--
-- Name: inventory_category; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_category (
    id integer NOT NULL,
    parent_id integer,
    name character varying(200)
);


ALTER TABLE public.inventory_category OWNER TO remya;

--
-- Name: inventory_category_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_category_id_seq OWNER TO remya;

--
-- Name: inventory_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_category_id_seq OWNED BY inventory_category.id;


--
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_item (
    id integer NOT NULL,
    vat_type_id integer,
    product_id integer,
    brand_id integer,
    name character varying(200),
    code character varying(200) NOT NULL,
    item_type character varying(50) DEFAULT 'Stockable'::character varying NOT NULL,
    cess numeric(14,2) DEFAULT 0.00 NOT NULL,
    size character varying(200),
    barcode character varying(200),
    description text,
    offer_quantity numeric(50,5) DEFAULT 0.00000 NOT NULL,
    uom character varying(200),
    packets_per_box numeric(50,5),
    pieces_per_box numeric(50,5),
    pieces_per_packet numeric(50,5),
    unit_per_piece numeric(50,5),
    smallest_unit character varying(200),
    unit_per_packet numeric(50,5),
    actual_smallest_uom character varying(200),
    unit_per_box numeric(50,5),
    uoms text,
    room_number character varying(200),
    shelf_number character varying(200)
);


ALTER TABLE public.inventory_item OWNER TO remya;

--
-- Name: inventory_item_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_item_id_seq OWNER TO remya;

--
-- Name: inventory_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_item_id_seq OWNED BY inventory_item.id;


--
-- Name: inventory_openingstock; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_openingstock (
    id integer NOT NULL,
    date date,
    transaction_reference_no character varying(200)
);


ALTER TABLE public.inventory_openingstock OWNER TO remya;

--
-- Name: inventory_openingstock_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_openingstock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_openingstock_id_seq OWNER TO remya;

--
-- Name: inventory_openingstock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_openingstock_id_seq OWNED BY inventory_openingstock.id;


--
-- Name: inventory_openingstockitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_openingstockitem (
    id integer NOT NULL,
    opening_stock_id integer,
    batch_item_id integer,
    quantity numeric(20,5) DEFAULT 0.00000 NOT NULL,
    uom character varying(200),
    purchase_price numeric(20,5) DEFAULT 0.00000 NOT NULL,
    net_amount numeric(20,5) DEFAULT 0.00000 NOT NULL
);


ALTER TABLE public.inventory_openingstockitem OWNER TO remya;

--
-- Name: inventory_openingstockitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_openingstockitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_openingstockitem_id_seq OWNER TO remya;

--
-- Name: inventory_openingstockitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_openingstockitem_id_seq OWNED BY inventory_openingstockitem.id;


--
-- Name: inventory_openingstockvalue; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_openingstockvalue (
    id integer NOT NULL,
    stock_by_value numeric(20,5)
);


ALTER TABLE public.inventory_openingstockvalue OWNER TO remya;

--
-- Name: inventory_openingstockvalue_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_openingstockvalue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_openingstockvalue_id_seq OWNER TO remya;

--
-- Name: inventory_openingstockvalue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_openingstockvalue_id_seq OWNED BY inventory_openingstockvalue.id;


--
-- Name: inventory_product; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_product (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(200)
);


ALTER TABLE public.inventory_product OWNER TO remya;

--
-- Name: inventory_product_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_product_id_seq OWNER TO remya;

--
-- Name: inventory_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_product_id_seq OWNED BY inventory_product.id;


--
-- Name: inventory_stockvalue; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_stockvalue (
    id integer NOT NULL,
    stock_by_value numeric(20,5)
);


ALTER TABLE public.inventory_stockvalue OWNER TO remya;

--
-- Name: inventory_stockvalue_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_stockvalue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_stockvalue_id_seq OWNER TO remya;

--
-- Name: inventory_stockvalue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_stockvalue_id_seq OWNED BY inventory_stockvalue.id;


--
-- Name: inventory_vattype; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE inventory_vattype (
    id integer NOT NULL,
    vat_type character varying(200),
    tax_percentage numeric(14,2) DEFAULT 0.00 NOT NULL
);


ALTER TABLE public.inventory_vattype OWNER TO remya;

--
-- Name: inventory_vattype_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE inventory_vattype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_vattype_id_seq OWNER TO remya;

--
-- Name: inventory_vattype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE inventory_vattype_id_seq OWNED BY inventory_vattype.id;


--
-- Name: purchases_freightvalue; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE purchases_freightvalue (
    id integer NOT NULL,
    freight_value numeric(20,5)
);


ALTER TABLE public.purchases_freightvalue OWNER TO remya;

--
-- Name: purchases_freightvalue_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE purchases_freightvalue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_freightvalue_id_seq OWNER TO remya;

--
-- Name: purchases_freightvalue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE purchases_freightvalue_id_seq OWNED BY purchases_freightvalue.id;


--
-- Name: purchases_purchase; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE purchases_purchase (
    id integer NOT NULL,
    supplier_id integer,
    do_number character varying(200),
    transaction_reference_no character varying(200),
    purchase_invoice_number character varying(200),
    purchase_invoice_date date,
    payment_mode character varying(200),
    bank_name character varying(200),
    card_number character varying(200),
    cheque_date date,
    cheque_number character varying(200),
    branch character varying(200),
    card_holder_name character varying(200),
    discount numeric(14,2) DEFAULT 0.00 NOT NULL,
    purchase_tax numeric(20,2) NOT NULL,
    grant_total numeric(14,2) DEFAULT 0.00 NOT NULL,
    supplier_tin character varying(100),
    owner_tin character varying(100),
    paid numeric(14,2) NOT NULL,
    balance numeric(14,2) NOT NULL
);


ALTER TABLE public.purchases_purchase OWNER TO remya;

--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE purchases_purchase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_purchase_id_seq OWNER TO remya;

--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE purchases_purchase_id_seq OWNED BY purchases_purchase.id;


--
-- Name: purchases_purchaseitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE purchases_purchaseitem (
    id integer NOT NULL,
    purchase_id integer,
    batch_item_id integer,
    quantity numeric(20,5) DEFAULT 0.00000 NOT NULL,
    purchase_price numeric(20,5) DEFAULT 0.00000 NOT NULL,
    net_amount numeric(20,5) DEFAULT 0.00000 NOT NULL,
    uom character varying(200),
    unit_discount numeric(20,5) DEFAULT 0.00000 NOT NULL,
    quantity_in_smallest_unit numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    tax_included boolean DEFAULT false NOT NULL
);


ALTER TABLE public.purchases_purchaseitem OWNER TO remya;

--
-- Name: purchases_purchaseitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE purchases_purchaseitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_purchaseitem_id_seq OWNER TO remya;

--
-- Name: purchases_purchaseitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE purchases_purchaseitem_id_seq OWNED BY purchases_purchaseitem.id;


--
-- Name: purchases_purchasereturn; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE purchases_purchasereturn (
    id integer NOT NULL,
    purchase_id integer,
    return_invoice_number character varying(200),
    invoice_date date,
    grant_total numeric(20,2) DEFAULT 0.00 NOT NULL,
    discount numeric(20,2) DEFAULT 0.00 NOT NULL,
    purchase_tax numeric(20,2) NOT NULL,
    transaction_reference_no character varying(200),
    payment_mode character varying(200),
    bank_name character varying(200),
    card_number character varying(200),
    cheque_date date,
    cheque_number character varying(200),
    branch character varying(200),
    card_holder_name character varying(200)
);


ALTER TABLE public.purchases_purchasereturn OWNER TO remya;

--
-- Name: purchases_purchasereturn_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE purchases_purchasereturn_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_purchasereturn_id_seq OWNER TO remya;

--
-- Name: purchases_purchasereturn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE purchases_purchasereturn_id_seq OWNED BY purchases_purchasereturn.id;


--
-- Name: purchases_purchasereturnitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE purchases_purchasereturnitem (
    id integer NOT NULL,
    purchase_return_id integer NOT NULL,
    purchase_item_id integer NOT NULL,
    quantity numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    net_amount numeric(20,10) DEFAULT 0.0000000000 NOT NULL
);


ALTER TABLE public.purchases_purchasereturnitem OWNER TO remya;

--
-- Name: purchases_purchasereturnitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE purchases_purchasereturnitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_purchasereturnitem_id_seq OWNER TO remya;

--
-- Name: purchases_purchasereturnitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE purchases_purchasereturnitem_id_seq OWNED BY purchases_purchasereturnitem.id;


--
-- Name: sales_deliverynote; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_deliverynote (
    id integer NOT NULL,
    customer_id integer,
    salesman_id integer,
    do_number character varying(200),
    bill_type character varying(200),
    deliverynote_invoice_number character varying(200),
    auto_invoice_number character varying(200),
    deliverynote_invoice_date date,
    discount numeric(14,2) DEFAULT 0.00 NOT NULL,
    grant_total numeric(14,2) DEFAULT 0.00 NOT NULL,
    round_off numeric(14,2) DEFAULT 0.00 NOT NULL,
    cess numeric(14,2) DEFAULT 0.00 NOT NULL,
    is_converted boolean NOT NULL
);


ALTER TABLE public.sales_deliverynote OWNER TO remya;

--
-- Name: sales_deliverynote_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_deliverynote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_deliverynote_id_seq OWNER TO remya;

--
-- Name: sales_deliverynote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_deliverynote_id_seq OWNED BY sales_deliverynote.id;


--
-- Name: sales_deliverynoteitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_deliverynoteitem (
    id integer NOT NULL,
    delivery_id integer,
    item_id integer,
    batch_item_id integer,
    quantity numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    uom character varying(200),
    mrp numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    net_amount numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    price_type character varying(200)
);


ALTER TABLE public.sales_deliverynoteitem OWNER TO remya;

--
-- Name: sales_deliverynoteitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_deliverynoteitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_deliverynoteitem_id_seq OWNER TO remya;

--
-- Name: sales_deliverynoteitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_deliverynoteitem_id_seq OWNED BY sales_deliverynoteitem.id;


--
-- Name: sales_editedinvoice; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_editedinvoice (
    id integer NOT NULL,
    edited_invoice_sales_id integer NOT NULL,
    invoice_no character varying(200),
    invoice_type character varying(200)
);


ALTER TABLE public.sales_editedinvoice OWNER TO remya;

--
-- Name: sales_editedinvoice_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_editedinvoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_editedinvoice_id_seq OWNER TO remya;

--
-- Name: sales_editedinvoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_editedinvoice_id_seq OWNED BY sales_editedinvoice.id;


--
-- Name: sales_editedinvoicesale; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_editedinvoicesale (
    id integer NOT NULL,
    customer_id integer,
    salesman_id integer,
    created_by_id integer,
    do_number character varying(200),
    bill_type character varying(200),
    transaction_reference_no character varying(200),
    sales_invoice_number character varying(200),
    sales_invoice_date date,
    payment_mode character varying(200),
    bank_name character varying(200),
    card_number character varying(200),
    cheque_date date,
    cheque_number character varying(200),
    branch character varying(200),
    card_holder_name character varying(200),
    discount numeric(14,2) DEFAULT 0.00 NOT NULL,
    grant_total numeric(14,2) DEFAULT 0.00 NOT NULL,
    round_off numeric(14,2) DEFAULT 0.00 NOT NULL,
    cess numeric(14,2) DEFAULT 0.00 NOT NULL
);


ALTER TABLE public.sales_editedinvoicesale OWNER TO remya;

--
-- Name: sales_editedinvoicesale_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_editedinvoicesale_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_editedinvoicesale_id_seq OWNER TO remya;

--
-- Name: sales_editedinvoicesale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_editedinvoicesale_id_seq OWNED BY sales_editedinvoicesale.id;


--
-- Name: sales_editedinvoicesaleitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_editedinvoicesaleitem (
    id integer NOT NULL,
    edited_invoice_sales_id integer NOT NULL,
    batch_item_id integer,
    item_id integer,
    price_type character varying(200),
    quantity numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    uom character varying(200),
    mrp numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    net_amount numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    quantity_in_purchase_unit numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    quantity_in_smallest_unit numeric(20,10) DEFAULT 0.0000000000 NOT NULL
);


ALTER TABLE public.sales_editedinvoicesaleitem OWNER TO remya;

--
-- Name: sales_editedinvoicesaleitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_editedinvoicesaleitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_editedinvoicesaleitem_id_seq OWNER TO remya;

--
-- Name: sales_editedinvoicesaleitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_editedinvoicesaleitem_id_seq OWNED BY sales_editedinvoicesaleitem.id;


--
-- Name: sales_editedreceipt; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_editedreceipt (
    id integer NOT NULL,
    edited_invoice_sales_id integer NOT NULL,
    receipt_no character varying(200)
);


ALTER TABLE public.sales_editedreceipt OWNER TO remya;

--
-- Name: sales_editedreceipt_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_editedreceipt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_editedreceipt_id_seq OWNER TO remya;

--
-- Name: sales_editedreceipt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_editedreceipt_id_seq OWNED BY sales_editedreceipt.id;


--
-- Name: sales_estimate; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_estimate (
    id integer NOT NULL,
    customer_id integer,
    salesman_id integer,
    do_number character varying(200),
    bill_type character varying(200),
    estimate_invoice_number character varying(200),
    auto_invoice_number character varying(200),
    estimate_invoice_date date,
    discount numeric(14,2) DEFAULT 0.00 NOT NULL,
    grant_total numeric(14,2) DEFAULT 0.00 NOT NULL,
    round_off numeric(14,2) NOT NULL,
    cess numeric(14,2) NOT NULL
);


ALTER TABLE public.sales_estimate OWNER TO remya;

--
-- Name: sales_estimate_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_estimate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_estimate_id_seq OWNER TO remya;

--
-- Name: sales_estimate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_estimate_id_seq OWNED BY sales_estimate.id;


--
-- Name: sales_estimateitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_estimateitem (
    id integer NOT NULL,
    estimate_id integer,
    item_id integer,
    batch_item_id integer,
    quantity numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    uom character varying(200),
    mrp numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    net_amount numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    price_type character varying(200)
);


ALTER TABLE public.sales_estimateitem OWNER TO remya;

--
-- Name: sales_estimateitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_estimateitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_estimateitem_id_seq OWNER TO remya;

--
-- Name: sales_estimateitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_estimateitem_id_seq OWNED BY sales_estimateitem.id;


--
-- Name: sales_invoice; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_invoice (
    id integer NOT NULL,
    sales_id integer NOT NULL,
    invoice_no character varying(200),
    invoice_type character varying(200)
);


ALTER TABLE public.sales_invoice OWNER TO remya;

--
-- Name: sales_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_invoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_invoice_id_seq OWNER TO remya;

--
-- Name: sales_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_invoice_id_seq OWNED BY sales_invoice.id;


--
-- Name: sales_receipt; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_receipt (
    id integer NOT NULL,
    sales_id integer NOT NULL,
    receipt_no character varying(200)
);


ALTER TABLE public.sales_receipt OWNER TO remya;

--
-- Name: sales_receipt_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_receipt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_receipt_id_seq OWNER TO remya;

--
-- Name: sales_receipt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_receipt_id_seq OWNED BY sales_receipt.id;


--
-- Name: sales_sale; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_sale (
    id integer NOT NULL,
    customer_id integer,
    salesman_id integer,
    created_by_id integer,
    do_number character varying(200),
    bill_type character varying(200),
    transaction_reference_no character varying(200),
    sales_invoice_number character varying(200),
    sales_invoice_date date,
    payment_mode character varying(200),
    bank_name character varying(200),
    card_number character varying(200),
    cheque_date date,
    cheque_number character varying(200),
    branch character varying(200),
    card_holder_name character varying(200),
    discount numeric(14,2) DEFAULT 0.00 NOT NULL,
    grant_total numeric(14,2) DEFAULT 0.00 NOT NULL,
    round_off numeric(14,2) DEFAULT 0.00 NOT NULL,
    cess numeric(14,2) DEFAULT 0.00 NOT NULL,
    customer_tin character varying(100),
    owner_tin character varying(100),
    sales_tax numeric(14,2) NOT NULL,
    paid numeric(14,2) NOT NULL,
    balance numeric(14,2) NOT NULL,
    customer_bonus_point_amount numeric(14,2) NOT NULL,
    salesman_bonus_point_amount numeric(14,2) NOT NULL,
    deliverynote_id integer
);


ALTER TABLE public.sales_sale OWNER TO remya;

--
-- Name: sales_sale_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_sale_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_sale_id_seq OWNER TO remya;

--
-- Name: sales_sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_sale_id_seq OWNED BY sales_sale.id;


--
-- Name: sales_salesitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_salesitem (
    id integer NOT NULL,
    sales_id integer NOT NULL,
    batch_item_id integer,
    item_id integer,
    quantity numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    uom character varying(200),
    mrp numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    net_amount numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    price_type character varying(200)
);


ALTER TABLE public.sales_salesitem OWNER TO remya;

--
-- Name: sales_salesitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_salesitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_salesitem_id_seq OWNER TO remya;

--
-- Name: sales_salesitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_salesitem_id_seq OWNED BY sales_salesitem.id;


--
-- Name: sales_salesreturn; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_salesreturn (
    id integer NOT NULL,
    sales_id integer,
    transaction_reference_no character varying(200),
    return_invoice_number character varying(200),
    invoice_date date,
    grant_total numeric(20,2) DEFAULT 0.00 NOT NULL,
    payment_mode character varying(200),
    bank_name character varying(200),
    card_number character varying(200),
    cheque_date date,
    cheque_number character varying(200),
    branch character varying(200),
    card_holder_name character varying(200)
);


ALTER TABLE public.sales_salesreturn OWNER TO remya;

--
-- Name: sales_salesreturn_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_salesreturn_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_salesreturn_id_seq OWNER TO remya;

--
-- Name: sales_salesreturn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_salesreturn_id_seq OWNED BY sales_salesreturn.id;


--
-- Name: sales_salesreturnitem; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE sales_salesreturnitem (
    id integer NOT NULL,
    sales_return_id integer,
    sales_item_id integer NOT NULL,
    uom character varying(200),
    quantity numeric(20,10) DEFAULT 0.0000000000 NOT NULL,
    net_amount numeric(20,10) DEFAULT 0.0000000000 NOT NULL
);


ALTER TABLE public.sales_salesreturnitem OWNER TO remya;

--
-- Name: sales_salesreturnitem_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE sales_salesreturnitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_salesreturnitem_id_seq OWNER TO remya;

--
-- Name: sales_salesreturnitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE sales_salesreturnitem_id_seq OWNED BY sales_salesreturnitem.id;


--
-- Name: south_migrationhistory; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE south_migrationhistory (
    id integer NOT NULL,
    app_name character varying(255) NOT NULL,
    migration character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.south_migrationhistory OWNER TO remya;

--
-- Name: south_migrationhistory_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE south_migrationhistory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.south_migrationhistory_id_seq OWNER TO remya;

--
-- Name: south_migrationhistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE south_migrationhistory_id_seq OWNED BY south_migrationhistory.id;


--
-- Name: suppliers_supplier; Type: TABLE; Schema: public; Owner: remya; Tablespace: 
--

CREATE TABLE suppliers_supplier (
    id integer NOT NULL,
    ledger_id integer,
    name character varying(200),
    address text,
    email character varying(200),
    contact_no character varying(200),
    credit_period integer,
    credit_period_parameter character varying(100)
);


ALTER TABLE public.suppliers_supplier OWNER TO remya;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: remya
--

CREATE SEQUENCE suppliers_supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_supplier_id_seq OWNER TO remya;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: remya
--

ALTER SEQUENCE suppliers_supplier_id_seq OWNED BY suppliers_supplier.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_ledger ALTER COLUMN id SET DEFAULT nextval('accounts_ledger_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_ledgerentry ALTER COLUMN id SET DEFAULT nextval('accounts_ledgerentry_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_transaction ALTER COLUMN id SET DEFAULT nextval('accounts_transaction_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_bonuspoint ALTER COLUMN id SET DEFAULT nextval('administration_bonuspoint_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_permission ALTER COLUMN id SET DEFAULT nextval('administration_permission_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_salesman ALTER COLUMN id SET DEFAULT nextval('administration_salesman_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_serialnobill ALTER COLUMN id SET DEFAULT nextval('administration_serialnobill_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_serialnoinvoice ALTER COLUMN id SET DEFAULT nextval('administration_serialnoinvoice_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_staff ALTER COLUMN id SET DEFAULT nextval('administration_staff_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_group ALTER COLUMN id SET DEFAULT nextval('auth_group_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_group_permissions ALTER COLUMN id SET DEFAULT nextval('auth_group_permissions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_permission ALTER COLUMN id SET DEFAULT nextval('auth_permission_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user ALTER COLUMN id SET DEFAULT nextval('auth_user_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user_groups ALTER COLUMN id SET DEFAULT nextval('auth_user_groups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user_user_permissions ALTER COLUMN id SET DEFAULT nextval('auth_user_user_permissions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY customers_customer ALTER COLUMN id SET DEFAULT nextval('customers_customer_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY dashboard_postdatedcheque ALTER COLUMN id SET DEFAULT nextval('dashboard_postdatedcheque_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY dashboard_stockquantityalert ALTER COLUMN id SET DEFAULT nextval('dashboard_stockquantityalert_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY dashboard_stockquantityalert_batch_items ALTER COLUMN id SET DEFAULT nextval('dashboard_stockquantityalert_batch_items_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY django_admin_log ALTER COLUMN id SET DEFAULT nextval('django_admin_log_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY django_content_type ALTER COLUMN id SET DEFAULT nextval('django_content_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY django_site ALTER COLUMN id SET DEFAULT nextval('django_site_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_batch ALTER COLUMN id SET DEFAULT nextval('inventory_batch_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_batchitem ALTER COLUMN id SET DEFAULT nextval('inventory_batchitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_brand ALTER COLUMN id SET DEFAULT nextval('inventory_brand_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_category ALTER COLUMN id SET DEFAULT nextval('inventory_category_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_item ALTER COLUMN id SET DEFAULT nextval('inventory_item_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_openingstock ALTER COLUMN id SET DEFAULT nextval('inventory_openingstock_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_openingstockitem ALTER COLUMN id SET DEFAULT nextval('inventory_openingstockitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_openingstockvalue ALTER COLUMN id SET DEFAULT nextval('inventory_openingstockvalue_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_product ALTER COLUMN id SET DEFAULT nextval('inventory_product_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_stockvalue ALTER COLUMN id SET DEFAULT nextval('inventory_stockvalue_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_vattype ALTER COLUMN id SET DEFAULT nextval('inventory_vattype_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_freightvalue ALTER COLUMN id SET DEFAULT nextval('purchases_freightvalue_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchase ALTER COLUMN id SET DEFAULT nextval('purchases_purchase_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchaseitem ALTER COLUMN id SET DEFAULT nextval('purchases_purchaseitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchasereturn ALTER COLUMN id SET DEFAULT nextval('purchases_purchasereturn_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchasereturnitem ALTER COLUMN id SET DEFAULT nextval('purchases_purchasereturnitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynote ALTER COLUMN id SET DEFAULT nextval('sales_deliverynote_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynoteitem ALTER COLUMN id SET DEFAULT nextval('sales_deliverynoteitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoice ALTER COLUMN id SET DEFAULT nextval('sales_editedinvoice_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesale ALTER COLUMN id SET DEFAULT nextval('sales_editedinvoicesale_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesaleitem ALTER COLUMN id SET DEFAULT nextval('sales_editedinvoicesaleitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedreceipt ALTER COLUMN id SET DEFAULT nextval('sales_editedreceipt_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimate ALTER COLUMN id SET DEFAULT nextval('sales_estimate_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimateitem ALTER COLUMN id SET DEFAULT nextval('sales_estimateitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_invoice ALTER COLUMN id SET DEFAULT nextval('sales_invoice_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_receipt ALTER COLUMN id SET DEFAULT nextval('sales_receipt_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_sale ALTER COLUMN id SET DEFAULT nextval('sales_sale_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesitem ALTER COLUMN id SET DEFAULT nextval('sales_salesitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesreturn ALTER COLUMN id SET DEFAULT nextval('sales_salesreturn_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesreturnitem ALTER COLUMN id SET DEFAULT nextval('sales_salesreturnitem_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY south_migrationhistory ALTER COLUMN id SET DEFAULT nextval('south_migrationhistory_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: remya
--

ALTER TABLE ONLY suppliers_supplier ALTER COLUMN id SET DEFAULT nextval('suppliers_supplier_id_seq'::regclass);


--
-- Data for Name: accounts_ledger; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY accounts_ledger (id, parent_id, name, description, balance, account_code) FROM stdin;
1	\N	Assets		0.00000	1000
2	\N	Liabilities		0.00000	2000
3	\N	Direct Income		0.00000	3000
4	\N	Direct Expenses		0.00000	4000
5	\N	Indirect Income		0.00000	5000
6	\N	Indirect Expenses		0.00000	6000
7	5	Commision Recieved		0.00000	5001
8	5	Discount Recieved		0.00000	5002
9	4	Inward Frieght		0.00000	4001
10	4	Purchase		0.00000	4002
11	10	Purchase Return		0.00000	4003
12	3	Sales		0.00000	3001
13	12	Sales Return		0.00000	3002
14	6	Salary		0.00000	6001
15	6	Electricity		0.00000	6002
16	6	Rent		0.00000	6003
17	6	Depreciation		0.00000	6004
18	6	Discount Given		0.00000	6005
19	6	Consumables		0.00000	6006
20	1	Current Assets		0.00000	1001
21	1	Fixed Assets		0.00000	1002
22	20	Bank		0.00000	1003
23	20	Sundry Debtors		0.00000	1004
24	20	Cash		0.00000	1005
25	20	Stock		0.00000	1006
26	21	Building		0.00000	1007
27	21	Machinery		0.00000	1008
28	21	Furniture and Fixtures		0.00000	1009
29	21	 Land		0.00000	1010
30	22	State Bank Of India		0.00000	1011
31	23	Counter Sales 		0.00000	1012
32	2	Current Liabilities		0.00000	2001
33	2	Non Current Liabilities		0.00000	2002
34	32	Duties and Taxes		0.00000	2003
35	32	Sundry Creditors		0.00000	2004
36	32	 Bank OD		0.00000	2005
37	32	Advances and Borrowings		0.00000	2006
38	33	Term Loan		0.00000	2007
39	33	Partner's Capital Account		0.00000	2008
40	34	Output Vat (Sales)		0.00000	2009
41	34	Input Vat (Purchases)		0.00000	2010
\.


--
-- Name: accounts_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('accounts_ledger_id_seq', 41, true);


--
-- Data for Name: accounts_ledgerentry; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY accounts_ledgerentry (id, ledger_id, credit_amount, debit_amount, date, transaction_reference_number) FROM stdin;
\.


--
-- Name: accounts_ledgerentry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('accounts_ledgerentry_id_seq', 1, false);


--
-- Data for Name: accounts_transaction; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY accounts_transaction (id, transaction_ref, debit_ledger_id, credit_ledger_id, transaction_date, debit_amount, credit_amount, narration, payment_mode, bank_name, cheque_date, cheque_number, branch, card_holder_name, card_no, invoice) FROM stdin;
\.


--
-- Name: accounts_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('accounts_transaction_id_seq', 1, false);


--
-- Data for Name: administration_bonuspoint; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY administration_bonuspoint (id, bonus_type, bonus_point, bonus_amount) FROM stdin;
\.


--
-- Name: administration_bonuspoint_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('administration_bonuspoint_id_seq', 1, false);


--
-- Data for Name: administration_permission; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY administration_permission (id, accounts_permission, inventory_permission, purchase_permission, sales_permission, suppliers, customers, reports) FROM stdin;
\.


--
-- Name: administration_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('administration_permission_id_seq', 1, false);


--
-- Data for Name: administration_salesman; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY administration_salesman (id, first_name, last_name, address, contact_no, email, bonus_point, incentive_per_sale) FROM stdin;
\.


--
-- Name: administration_salesman_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('administration_salesman_id_seq', 1, false);


--
-- Data for Name: administration_serialnobill; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY administration_serialnobill (id, is_auto_generated, prefix, user_id, starting_no) FROM stdin;
\.


--
-- Name: administration_serialnobill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('administration_serialnobill_id_seq', 1, false);


--
-- Data for Name: administration_serialnoinvoice; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY administration_serialnoinvoice (id, is_auto_generated, prefix, user_id, starting_no) FROM stdin;
\.


--
-- Name: administration_serialnoinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('administration_serialnoinvoice_id_seq', 1, false);


--
-- Data for Name: administration_staff; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY administration_staff (id, user_id, designation, address, contact_no, permission_id) FROM stdin;
\.


--
-- Name: administration_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('administration_staff_id_seq', 1, false);


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY auth_group (id, name) FROM stdin;
\.


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('auth_group_id_seq', 1, false);


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('auth_group_permissions_id_seq', 1, false);


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add permission	1	add_permission
2	Can change permission	1	change_permission
3	Can delete permission	1	delete_permission
4	Can add group	2	add_group
5	Can change group	2	change_group
6	Can delete group	2	delete_group
7	Can add user	3	add_user
8	Can change user	3	change_user
9	Can delete user	3	delete_user
10	Can add content type	4	add_contenttype
11	Can change content type	4	change_contenttype
12	Can delete content type	4	delete_contenttype
13	Can add session	5	add_session
14	Can change session	5	change_session
15	Can delete session	5	delete_session
16	Can add site	6	add_site
17	Can change site	6	change_site
18	Can delete site	6	delete_site
19	Can add log entry	7	add_logentry
20	Can change log entry	7	change_logentry
21	Can delete log entry	7	delete_logentry
22	Can add migration history	8	add_migrationhistory
23	Can change migration history	8	change_migrationhistory
24	Can delete migration history	8	delete_migrationhistory
25	Can add permission	9	add_permission
26	Can change permission	9	change_permission
27	Can delete permission	9	delete_permission
28	Can add staff	10	add_staff
29	Can change staff	10	change_staff
30	Can delete staff	10	delete_staff
31	Can add bonus point	11	add_bonuspoint
32	Can change bonus point	11	change_bonuspoint
33	Can delete bonus point	11	delete_bonuspoint
34	Can add salesman	12	add_salesman
35	Can change salesman	12	change_salesman
36	Can delete salesman	12	delete_salesman
37	Can add serial no bill	13	add_serialnobill
38	Can change serial no bill	13	change_serialnobill
39	Can delete serial no bill	13	delete_serialnobill
40	Can add serial no invoice	14	add_serialnoinvoice
41	Can change serial no invoice	14	change_serialnoinvoice
42	Can delete serial no invoice	14	delete_serialnoinvoice
43	Can add category	15	add_category
44	Can change category	15	change_category
45	Can delete category	15	delete_category
46	Can add product	16	add_product
47	Can change product	16	change_product
48	Can delete product	16	delete_product
49	Can add brand	17	add_brand
50	Can change brand	17	change_brand
51	Can delete brand	17	delete_brand
52	Can add vat type	18	add_vattype
53	Can change vat type	18	change_vattype
54	Can delete vat type	18	delete_vattype
55	Can add item	19	add_item
56	Can change item	19	change_item
57	Can delete item	19	delete_item
58	Can add batch	20	add_batch
59	Can change batch	20	change_batch
60	Can delete batch	20	delete_batch
61	Can add batch item	21	add_batchitem
62	Can change batch item	21	change_batchitem
63	Can delete batch item	21	delete_batchitem
64	Can add opening stock	22	add_openingstock
65	Can change opening stock	22	change_openingstock
66	Can delete opening stock	22	delete_openingstock
67	Can add opening stock item	23	add_openingstockitem
68	Can change opening stock item	23	change_openingstockitem
69	Can delete opening stock item	23	delete_openingstockitem
70	Can add stock value	24	add_stockvalue
71	Can change stock value	24	change_stockvalue
72	Can delete stock value	24	delete_stockvalue
73	Can add opening stock value	25	add_openingstockvalue
74	Can change opening stock value	25	change_openingstockvalue
75	Can delete opening stock value	25	delete_openingstockvalue
76	Can add post dated cheque	26	add_postdatedcheque
77	Can change post dated cheque	26	change_postdatedcheque
78	Can delete post dated cheque	26	delete_postdatedcheque
79	Can add stock quantity alert	27	add_stockquantityalert
80	Can change stock quantity alert	27	change_stockquantityalert
81	Can delete stock quantity alert	27	delete_stockquantityalert
82	Can add ledger	28	add_ledger
83	Can change ledger	28	change_ledger
84	Can delete ledger	28	delete_ledger
85	Can add ledger entry	29	add_ledgerentry
86	Can change ledger entry	29	change_ledgerentry
87	Can delete ledger entry	29	delete_ledgerentry
88	Can add transaction	30	add_transaction
89	Can change transaction	30	change_transaction
90	Can delete transaction	30	delete_transaction
91	Can add customer	31	add_customer
92	Can change customer	31	change_customer
93	Can delete customer	31	delete_customer
94	Can add supplier	32	add_supplier
95	Can change supplier	32	change_supplier
96	Can delete supplier	32	delete_supplier
97	Can add purchase	33	add_purchase
98	Can change purchase	33	change_purchase
99	Can delete purchase	33	delete_purchase
100	Can add purchase item	34	add_purchaseitem
101	Can change purchase item	34	change_purchaseitem
102	Can delete purchase item	34	delete_purchaseitem
103	Can add purchase return	35	add_purchasereturn
104	Can change purchase return	35	change_purchasereturn
105	Can delete purchase return	35	delete_purchasereturn
106	Can add purchase return item	36	add_purchasereturnitem
107	Can change purchase return item	36	change_purchasereturnitem
108	Can delete purchase return item	36	delete_purchasereturnitem
109	Can add freight value	37	add_freightvalue
110	Can change freight value	37	change_freightvalue
111	Can delete freight value	37	delete_freightvalue
112	Can add delivery note	38	add_deliverynote
113	Can change delivery note	38	change_deliverynote
114	Can delete delivery note	38	delete_deliverynote
115	Can add deliverynote item	39	add_deliverynoteitem
116	Can change deliverynote item	39	change_deliverynoteitem
117	Can delete deliverynote item	39	delete_deliverynoteitem
118	Can add sale	40	add_sale
119	Can change sale	40	change_sale
120	Can delete sale	40	delete_sale
121	Can add sales item	41	add_salesitem
122	Can change sales item	41	change_salesitem
123	Can delete sales item	41	delete_salesitem
124	Can add receipt	42	add_receipt
125	Can change receipt	42	change_receipt
126	Can delete receipt	42	delete_receipt
127	Can add invoice	43	add_invoice
128	Can change invoice	43	change_invoice
129	Can delete invoice	43	delete_invoice
130	Can add estimate	44	add_estimate
131	Can change estimate	44	change_estimate
132	Can delete estimate	44	delete_estimate
133	Can add estimate item	45	add_estimateitem
134	Can change estimate item	45	change_estimateitem
135	Can delete estimate item	45	delete_estimateitem
136	Can add sales return	46	add_salesreturn
137	Can change sales return	46	change_salesreturn
138	Can delete sales return	46	delete_salesreturn
139	Can add sales return item	47	add_salesreturnitem
140	Can change sales return item	47	change_salesreturnitem
141	Can delete sales return item	47	delete_salesreturnitem
142	Can add edited invoice sale	48	add_editedinvoicesale
143	Can change edited invoice sale	48	change_editedinvoicesale
144	Can delete edited invoice sale	48	delete_editedinvoicesale
145	Can add edited invoice sale item	49	add_editedinvoicesaleitem
146	Can change edited invoice sale item	49	change_editedinvoicesaleitem
147	Can delete edited invoice sale item	49	delete_editedinvoicesaleitem
148	Can add edited receipt	50	add_editedreceipt
149	Can change edited receipt	50	change_editedreceipt
150	Can delete edited receipt	50	delete_editedreceipt
151	Can add edited invoice	51	add_editedinvoice
152	Can change edited invoice	51	change_editedinvoice
153	Can delete edited invoice	51	delete_editedinvoice
\.


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('auth_permission_id_seq', 153, true);


--
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$10000$kF6Y6nKW7sXP$z23F8/xX7WzXAvHND5aIuJQvFA1wkPAHzpPtz3LC5xg=	2014-12-21 14:00:10.021798+05:30	t	root			remya@technomicssolutions.com	t	t	2014-12-21 11:42:50.612734+05:30
\.


--
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('auth_user_groups_id_seq', 1, false);


--
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('auth_user_id_seq', 1, true);


--
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('auth_user_user_permissions_id_seq', 1, false);


--
-- Data for Name: customers_customer; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY customers_customer (id, ledger_id, name, address, email, bonus_point, contact_number, area) FROM stdin;
\.


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('customers_customer_id_seq', 1, false);


--
-- Data for Name: dashboard_postdatedcheque; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY dashboard_postdatedcheque (id, cheque_date, transaction_ref, narration) FROM stdin;
\.


--
-- Name: dashboard_postdatedcheque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('dashboard_postdatedcheque_id_seq', 1, false);


--
-- Data for Name: dashboard_stockquantityalert; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY dashboard_stockquantityalert (id) FROM stdin;
\.


--
-- Data for Name: dashboard_stockquantityalert_batch_items; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY dashboard_stockquantityalert_batch_items (id, stockquantityalert_id, batchitem_id) FROM stdin;
\.


--
-- Name: dashboard_stockquantityalert_batch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('dashboard_stockquantityalert_batch_items_id_seq', 1, false);


--
-- Name: dashboard_stockquantityalert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('dashboard_stockquantityalert_id_seq', 1, false);


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY django_admin_log (id, action_time, user_id, content_type_id, object_id, object_repr, action_flag, change_message) FROM stdin;
\.


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('django_admin_log_id_seq', 1, false);


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY django_content_type (id, name, app_label, model) FROM stdin;
1	permission	auth	permission
2	group	auth	group
3	user	auth	user
4	content type	contenttypes	contenttype
5	session	sessions	session
6	site	sites	site
7	log entry	admin	logentry
8	migration history	south	migrationhistory
9	permission	administration	permission
10	staff	administration	staff
11	bonus point	administration	bonuspoint
12	salesman	administration	salesman
13	serial no bill	administration	serialnobill
14	serial no invoice	administration	serialnoinvoice
15	category	inventory	category
16	product	inventory	product
17	brand	inventory	brand
18	vat type	inventory	vattype
19	item	inventory	item
20	batch	inventory	batch
21	batch item	inventory	batchitem
22	opening stock	inventory	openingstock
23	opening stock item	inventory	openingstockitem
24	stock value	inventory	stockvalue
25	opening stock value	inventory	openingstockvalue
26	post dated cheque	dashboard	postdatedcheque
27	stock quantity alert	dashboard	stockquantityalert
28	ledger	accounts	ledger
29	ledger entry	accounts	ledgerentry
30	transaction	accounts	transaction
31	customer	customers	customer
32	supplier	suppliers	supplier
33	purchase	purchases	purchase
34	purchase item	purchases	purchaseitem
35	purchase return	purchases	purchasereturn
36	purchase return item	purchases	purchasereturnitem
37	freight value	purchases	freightvalue
38	delivery note	sales	deliverynote
39	deliverynote item	sales	deliverynoteitem
40	sale	sales	sale
41	sales item	sales	salesitem
42	receipt	sales	receipt
43	invoice	sales	invoice
44	estimate	sales	estimate
45	estimate item	sales	estimateitem
46	sales return	sales	salesreturn
47	sales return item	sales	salesreturnitem
48	edited invoice sale	sales	editedinvoicesale
49	edited invoice sale item	sales	editedinvoicesaleitem
50	edited receipt	sales	editedreceipt
51	edited invoice	sales	editedinvoice
\.


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('django_content_type_id_seq', 51, true);


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY django_session (session_key, session_data, expire_date) FROM stdin;
9hvv2kw1bnh7o1u2bl58l913z180cbvv	OGJlNzkwMDc5NmI3YzQ0ZWEwZGE2NDcwM2M1ZmQ4NzgxMzg2ODZjZTqAAn1xAShVEl9hdXRoX3VzZXJfYmFja2VuZHECVSlkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZHEDVQ1fYXV0aF91c2VyX2lkcQRLAXUu	2015-01-04 11:48:41.496046+05:30
k552k0hn0nzv5ed632fusaynyhp115xq	OGJlNzkwMDc5NmI3YzQ0ZWEwZGE2NDcwM2M1ZmQ4NzgxMzg2ODZjZTqAAn1xAShVEl9hdXRoX3VzZXJfYmFja2VuZHECVSlkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZHEDVQ1fYXV0aF91c2VyX2lkcQRLAXUu	2015-01-04 14:00:10.10027+05:30
\.


--
-- Data for Name: django_site; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY django_site (id, domain, name) FROM stdin;
1	example.com	example.com
\.


--
-- Name: django_site_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('django_site_id_seq', 1, true);


--
-- Data for Name: inventory_batch; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_batch (id, name, created_date, expiry_date) FROM stdin;
\.


--
-- Name: inventory_batch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_batch_id_seq', 1, false);


--
-- Data for Name: inventory_batchitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_batchitem (id, batch_id, item_id, purchase_price, cost_price, uom, whole_sale_price, retail_price, freight_charge, salesman_bonus_points_id, customer_bonus_points_id, customer_bonus_quantity, salesman_bonus_quantity, customer_card_price, whole_sale_profit_percentage, retail_profit_percentage, permissible_discount_percentage, branch_price, quantity_in_actual_unit, small_wholesale_price, small_retail_price, small_branch_price, small_customer_card_price) FROM stdin;
\.


--
-- Name: inventory_batchitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_batchitem_id_seq', 1, false);


--
-- Data for Name: inventory_brand; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_brand (id, name) FROM stdin;
2	Saffer
3	Conex|Bänninger
4	Dietsche
5	MasterFlow
6	Pyarry ware
7	Hindware
8	Jaquar
9	Magick Woods
10	Anmol
11	Star
12	Prince
13	Astral
\.


--
-- Name: inventory_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_brand_id_seq', 13, true);


--
-- Data for Name: inventory_category; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_category (id, parent_id, name) FROM stdin;
1	\N	Bathroom Fittings
2	\N	Electrical
3	1	Brass Valves And Fittings
\.


--
-- Name: inventory_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_category_id_seq', 3, true);


--
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_item (id, vat_type_id, product_id, brand_id, name, code, item_type, cess, size, barcode, description, offer_quantity, uom, packets_per_box, pieces_per_box, pieces_per_packet, unit_per_piece, smallest_unit, unit_per_packet, actual_smallest_uom, unit_per_box, uoms, room_number, shelf_number) FROM stdin;
1	\N	2	3	RB Ball Valves	ValConRB 1	Stockable	0.00		78945613	Valve	0.00000	piece	\N	\N	\N	\N	piece	\N	piece	\N	["piece"]	1	1
2	\N	2	4	Sant Brass Valves	ValDieSan2	Stockable	0.00		1241234	Valve	0.00000	piece	\N	\N	\N	\N	piece	\N	piece	\N	["piece"]	1	2
3	\N	3	8	Flush Tank	PluJaqFlu3	Stockable	0.00		325245		0.00000	piece	\N	\N	\N	\N	piece	\N	piece	\N	["piece"]	2	
4	\N	4	9	Magic Woods Bathroom Mirror	BatMagMag4	Stockable	0.00		54535		0.00000	piece	\N	\N	\N	\N	piece	\N	piece	\N	["piece"]	2	
5	\N	4	10	Anmol Mirror	BatAnmAnm5	Stockable	0.00		324		0.00000	piece	\N	\N	\N	\N	piece	\N	piece	\N	["piece"]	2	
8	\N	5	11	Star Pipe	PVCStaSta8	Stockable	0.00				0.00000	piece	\N	\N	\N	1.00000	Metre	\N	mm	\N	["mm","piece","Metre","cm"]	2	
9	\N	5	12	Prince	PVCPriPri9	Stockable	0.00				0.00000	piece	\N	\N	\N	2.00000	Metre	\N	mm	\N	["mm","piece","Metre","cm"]	2	
10	\N	5	13	Astral	PVCAstAst10	Stockable	0.00				0.00000	piece	\N	\N	\N	2.00000	Metre	\N	mm	\N	["mm","piece","Metre","cm"]	2	
\.


--
-- Name: inventory_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_item_id_seq', 10, true);


--
-- Data for Name: inventory_openingstock; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_openingstock (id, date, transaction_reference_no) FROM stdin;
\.


--
-- Name: inventory_openingstock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_openingstock_id_seq', 1, false);


--
-- Data for Name: inventory_openingstockitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_openingstockitem (id, opening_stock_id, batch_item_id, quantity, uom, purchase_price, net_amount) FROM stdin;
\.


--
-- Name: inventory_openingstockitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_openingstockitem_id_seq', 1, false);


--
-- Data for Name: inventory_openingstockvalue; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_openingstockvalue (id, stock_by_value) FROM stdin;
\.


--
-- Name: inventory_openingstockvalue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_openingstockvalue_id_seq', 1, false);


--
-- Data for Name: inventory_product; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_product (id, category_id, name) FROM stdin;
2	3	Valve
3	1	Plumbing Accessories
4	1	Bathroom Mirrors
5	1	PVC Pipes
\.


--
-- Name: inventory_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_product_id_seq', 5, true);


--
-- Data for Name: inventory_stockvalue; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_stockvalue (id, stock_by_value) FROM stdin;
\.


--
-- Name: inventory_stockvalue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_stockvalue_id_seq', 1, false);


--
-- Data for Name: inventory_vattype; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY inventory_vattype (id, vat_type, tax_percentage) FROM stdin;
\.


--
-- Name: inventory_vattype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('inventory_vattype_id_seq', 1, false);


--
-- Data for Name: purchases_freightvalue; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY purchases_freightvalue (id, freight_value) FROM stdin;
\.


--
-- Name: purchases_freightvalue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('purchases_freightvalue_id_seq', 1, false);


--
-- Data for Name: purchases_purchase; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY purchases_purchase (id, supplier_id, do_number, transaction_reference_no, purchase_invoice_number, purchase_invoice_date, payment_mode, bank_name, card_number, cheque_date, cheque_number, branch, card_holder_name, discount, purchase_tax, grant_total, supplier_tin, owner_tin, paid, balance) FROM stdin;
\.


--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('purchases_purchase_id_seq', 1, false);


--
-- Data for Name: purchases_purchaseitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY purchases_purchaseitem (id, purchase_id, batch_item_id, quantity, purchase_price, net_amount, uom, unit_discount, quantity_in_smallest_unit, tax_included) FROM stdin;
\.


--
-- Name: purchases_purchaseitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('purchases_purchaseitem_id_seq', 1, false);


--
-- Data for Name: purchases_purchasereturn; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY purchases_purchasereturn (id, purchase_id, return_invoice_number, invoice_date, grant_total, discount, purchase_tax, transaction_reference_no, payment_mode, bank_name, card_number, cheque_date, cheque_number, branch, card_holder_name) FROM stdin;
\.


--
-- Name: purchases_purchasereturn_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('purchases_purchasereturn_id_seq', 1, false);


--
-- Data for Name: purchases_purchasereturnitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY purchases_purchasereturnitem (id, purchase_return_id, purchase_item_id, quantity, net_amount) FROM stdin;
\.


--
-- Name: purchases_purchasereturnitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('purchases_purchasereturnitem_id_seq', 1, false);


--
-- Data for Name: sales_deliverynote; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_deliverynote (id, customer_id, salesman_id, do_number, bill_type, deliverynote_invoice_number, auto_invoice_number, deliverynote_invoice_date, discount, grant_total, round_off, cess, is_converted) FROM stdin;
\.


--
-- Name: sales_deliverynote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_deliverynote_id_seq', 1, false);


--
-- Data for Name: sales_deliverynoteitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_deliverynoteitem (id, delivery_id, item_id, batch_item_id, quantity, uom, mrp, net_amount, price_type) FROM stdin;
\.


--
-- Name: sales_deliverynoteitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_deliverynoteitem_id_seq', 1, false);


--
-- Data for Name: sales_editedinvoice; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_editedinvoice (id, edited_invoice_sales_id, invoice_no, invoice_type) FROM stdin;
\.


--
-- Name: sales_editedinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_editedinvoice_id_seq', 1, false);


--
-- Data for Name: sales_editedinvoicesale; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_editedinvoicesale (id, customer_id, salesman_id, created_by_id, do_number, bill_type, transaction_reference_no, sales_invoice_number, sales_invoice_date, payment_mode, bank_name, card_number, cheque_date, cheque_number, branch, card_holder_name, discount, grant_total, round_off, cess) FROM stdin;
\.


--
-- Name: sales_editedinvoicesale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_editedinvoicesale_id_seq', 1, false);


--
-- Data for Name: sales_editedinvoicesaleitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_editedinvoicesaleitem (id, edited_invoice_sales_id, batch_item_id, item_id, price_type, quantity, uom, mrp, net_amount, quantity_in_purchase_unit, quantity_in_smallest_unit) FROM stdin;
\.


--
-- Name: sales_editedinvoicesaleitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_editedinvoicesaleitem_id_seq', 1, false);


--
-- Data for Name: sales_editedreceipt; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_editedreceipt (id, edited_invoice_sales_id, receipt_no) FROM stdin;
\.


--
-- Name: sales_editedreceipt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_editedreceipt_id_seq', 1, false);


--
-- Data for Name: sales_estimate; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_estimate (id, customer_id, salesman_id, do_number, bill_type, estimate_invoice_number, auto_invoice_number, estimate_invoice_date, discount, grant_total, round_off, cess) FROM stdin;
\.


--
-- Name: sales_estimate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_estimate_id_seq', 1, false);


--
-- Data for Name: sales_estimateitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_estimateitem (id, estimate_id, item_id, batch_item_id, quantity, uom, mrp, net_amount, price_type) FROM stdin;
\.


--
-- Name: sales_estimateitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_estimateitem_id_seq', 1, false);


--
-- Data for Name: sales_invoice; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_invoice (id, sales_id, invoice_no, invoice_type) FROM stdin;
\.


--
-- Name: sales_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_invoice_id_seq', 1, false);


--
-- Data for Name: sales_receipt; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_receipt (id, sales_id, receipt_no) FROM stdin;
\.


--
-- Name: sales_receipt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_receipt_id_seq', 1, false);


--
-- Data for Name: sales_sale; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_sale (id, customer_id, salesman_id, created_by_id, do_number, bill_type, transaction_reference_no, sales_invoice_number, sales_invoice_date, payment_mode, bank_name, card_number, cheque_date, cheque_number, branch, card_holder_name, discount, grant_total, round_off, cess, customer_tin, owner_tin, sales_tax, paid, balance, customer_bonus_point_amount, salesman_bonus_point_amount, deliverynote_id) FROM stdin;
\.


--
-- Name: sales_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_sale_id_seq', 1, false);


--
-- Data for Name: sales_salesitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_salesitem (id, sales_id, batch_item_id, item_id, quantity, uom, mrp, net_amount, price_type) FROM stdin;
\.


--
-- Name: sales_salesitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_salesitem_id_seq', 1, false);


--
-- Data for Name: sales_salesreturn; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_salesreturn (id, sales_id, transaction_reference_no, return_invoice_number, invoice_date, grant_total, payment_mode, bank_name, card_number, cheque_date, cheque_number, branch, card_holder_name) FROM stdin;
\.


--
-- Name: sales_salesreturn_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_salesreturn_id_seq', 1, false);


--
-- Data for Name: sales_salesreturnitem; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY sales_salesreturnitem (id, sales_return_id, sales_item_id, uom, quantity, net_amount) FROM stdin;
\.


--
-- Name: sales_salesreturnitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('sales_salesreturnitem_id_seq', 1, false);


--
-- Data for Name: south_migrationhistory; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY south_migrationhistory (id, app_name, migration, applied) FROM stdin;
1	installation_settings	0001_initial	2014-12-21 11:42:57.491481+05:30
2	software_settings	0001_initial	2014-12-21 11:42:57.541529+05:30
3	administration	0001_initial	2014-12-21 11:42:57.577942+05:30
4	administration	0002_auto__add_permission__add_staff	2014-12-21 11:42:57.850789+05:30
5	administration	0003_auto__add_bonuspoint	2014-12-21 11:42:57.975856+05:30
6	administration	0004_auto__add_salesman	2014-12-21 11:42:58.131551+05:30
7	administration	0005_auto__add_field_salesman_area	2014-12-21 11:42:58.173863+05:30
8	administration	0006_auto__del_field_salesman_area	2014-12-21 11:42:58.220095+05:30
9	administration	0007_auto__add_group__add_field_salesman_area__add_field_staff_group	2014-12-21 11:42:58.441856+05:30
10	administration	0008_auto__del_field_salesman_area	2014-12-21 11:42:58.484621+05:30
11	administration	0009_auto__del_group__del_field_staff_group	2014-12-21 11:42:58.519558+05:30
12	administration	0010_auto__add_serialno	2014-12-21 11:42:58.597164+05:30
13	administration	0011_auto__del_serialno__add_serialnobill__add_serialnoinvoice	2014-12-21 11:42:58.733764+05:30
14	administration	0012_auto__add_field_serialnobill_user__add_field_serialnoinvoice_user	2014-12-21 11:42:58.876277+05:30
15	administration	0013_auto__del_field_serialnobill_starting_no__del_field_serialnoinvoice_st	2014-12-21 11:42:58.918257+05:30
16	administration	0014_auto__add_field_serialnobill_starting_no__add_field_serialnoinvoice_st	2014-12-21 11:42:58.962855+05:30
17	administration	0015_auto__add_field_permission_reports	2014-12-21 11:42:59.083986+05:30
18	administration	0015_auto__add_field_salesman_incentive_per_sale	2014-12-21 11:42:59.116709+05:30
19	inventory	0001_initial	2014-12-21 11:42:59.256771+05:30
20	inventory	0002_auto__add_uomconversion__add_openingstockitem__add_product__add_vattyp	2014-12-21 11:43:00.410872+05:30
21	inventory	0003_auto__del_field_openingstockitem_whole_sale_price__del_field_openingst	2014-12-21 11:43:00.452041+05:30
22	inventory	0004_auto__add_openingstockvalue__add_stockvalue	2014-12-21 11:43:00.587626+05:30
23	inventory	0005_auto__add_field_batchitem_batch_price__add_field_batchitem_customer_ca	2014-12-21 11:43:01.456885+05:30
24	inventory	0006_auto__add_field_batchitem_whole_sale_profit_percentage__add_field_batc	2014-12-21 11:43:02.093115+05:30
25	inventory	0007_auto__add_field_batchitem_permissible_discount_percentage	2014-12-21 11:43:02.967231+05:30
26	inventory	0008_auto__del_field_batchitem_batch_price__add_field_batchitem_branch_pric	2014-12-21 11:43:03.299106+05:30
27	inventory	0009_auto__add_field_item_actual_smallest_uom__add_field_batchitem_quantity	2014-12-21 11:43:03.687995+05:30
28	inventory	0010_auto__chg_field_batchitem_customer_bonus_quantity__chg_field_batchitem	2014-12-21 11:43:05.39591+05:30
29	inventory	0011_auto__add_field_item_unit_per_box__add_field_item_uoms	2014-12-21 11:43:05.435006+05:30
30	inventory	0012_auto__del_uomconversion__del_field_batchitem_uom_conversion	2014-12-21 11:43:05.495798+05:30
31	inventory	0013_auto__add_field_batchitem_small_wholesale_price__add_field_batchitem_s	2014-12-21 11:43:06.495194+05:30
32	inventory	0014_auto__chg_field_batchitem_small_wholesale_price__chg_field_batchitem_s	2014-12-21 11:43:07.681314+05:30
33	inventory	0015_auto__del_field_batchitem_quantity_in_purchase_unit__del_field_batchit	2014-12-21 11:43:07.721634+05:30
34	dashboard	0001_initial	2014-12-21 11:43:07.920968+05:30
35	dashboard	0002_auto__add_postdatedcheque	2014-12-21 11:43:08.054524+05:30
36	dashboard	0003_auto__add_stockquantityalert	2014-12-21 11:43:08.37056+05:30
37	accounts	0001_initial	2014-12-21 11:43:08.46537+05:30
38	accounts	0002_auto__add_ledger	2014-12-21 11:43:08.603771+05:30
39	accounts	0003_auto__add_ledgerentry	2014-12-21 11:43:08.725693+05:30
40	accounts	0004_auto__add_transaction	2014-12-21 11:43:08.937133+05:30
41	accounts	0005_auto__add_field_ledger_account_code	2014-12-21 11:43:09.026091+05:30
42	accounts	0006_auto__add_field_transaction_invoice	2014-12-21 11:43:09.059857+05:30
43	customers	0001_initial	2014-12-21 11:43:09.140897+05:30
44	customers	0002_initial	2014-12-21 11:43:09.391745+05:30
45	customers	0003_auto__del_field_customer_mobile__del_field_customer_telephone_number__	2014-12-21 11:43:09.425092+05:30
46	customers	0004_auto__add_field_customer_area	2014-12-21 11:43:09.446023+05:30
47	suppliers	0001_initial	2014-12-21 11:43:09.50402+05:30
48	suppliers	0002_auto__add_supplier	2014-12-21 11:43:09.792025+05:30
49	suppliers	0003_auto__del_field_supplier_mobile__del_field_supplier_telephone_number__	2014-12-21 11:43:09.825101+05:30
50	suppliers	0004_auto__add_field_supplier_credit_period__add_field_supplier_credit_peri	2014-12-21 11:43:09.845872+05:30
51	purchases	0001_initial	2014-12-21 11:43:09.90959+05:30
52	purchases	0002_auto__add_freightvalue__add_purchaseitem__add_purchasereturnitem__add_	2014-12-21 11:43:10.659904+05:30
53	purchases	0003_auto__del_field_purchaseitem_tax	2014-12-21 11:43:10.712307+05:30
54	purchases	0004_auto__add_field_purchasereturn_payment_mode__add_field_purchasereturn_	2014-12-21 11:43:10.836203+05:30
55	purchases	0005_auto__add_field_purchase_supplier_tin__add_field_purchase_owner_tin	2014-12-21 11:43:10.878578+05:30
56	purchases	0006_auto__chg_field_purchasereturn_purchase_tax__chg_field_purchase_purcha	2014-12-21 11:43:12.053453+05:30
57	purchases	0007_auto__add_field_purchase_paid__add_field_purchase_balance__add_field_p	2014-12-21 11:43:13.601022+05:30
58	purchases	0008_auto__del_field_purchase_is_payment_completed	2014-12-21 11:43:13.721236+05:30
59	sales	0001_initial	2014-12-21 11:43:14.171811+05:30
60	sales	0002_initial	2014-12-21 11:43:15.065759+05:30
61	sales	0003_auto__add_salesreturnitem__add_estimateitem__add_invoice__add_estimate	2014-12-21 11:43:16.19963+05:30
62	sales	0004_auto__add_field_salesitem_price_type	2014-12-21 11:43:16.275577+05:30
63	sales	0005_auto__add_editedinvoicesaleitem__add_editedinvoicesale	2014-12-21 11:43:16.721445+05:30
64	sales	0006_auto__add_editedreceipt__add_editedinvoice	2014-12-21 11:43:17.165428+05:30
65	sales	0007_auto__add_field_estimate_round_off__add_field_estimate_cess	2014-12-21 11:43:17.914565+05:30
66	sales	0008_auto__add_field_salesreturn_payment_mode__add_field_salesreturn_bank_n	2014-12-21 11:43:18.064495+05:30
67	sales	0009_auto__add_field_sale_customer_tin__add_field_sale_owner_tin	2014-12-21 11:43:18.150508+05:30
68	sales	0010_auto__add_field_sale_sales_tax	2014-12-21 11:43:18.444139+05:30
69	sales	0011_auto__add_deliverynoteitem__add_deliverynote	2014-12-21 11:43:18.942464+05:30
70	sales	0012_auto__add_field_sale_paid__add_field_sale_balance__add_field_sale_ispa	2014-12-21 11:43:19.673935+05:30
71	sales	0013_auto__del_field_sale_ispayment_completed	2014-12-21 11:43:19.764415+05:30
72	sales	0014_auto__add_field_sale_customer_bonus_point__add_field_sale_salesman_bon	2014-12-21 11:43:19.954087+05:30
73	sales	0015_auto__del_field_sale_salesman_bonus_point__del_field_sale_customer_bon	2014-12-21 11:43:20.042183+05:30
74	sales	0016_auto__add_field_sale_customer_bonus_point_amount__add_field_sale_sales	2014-12-21 11:43:20.559877+05:30
75	sales	0017_auto__add_field_deliverynoteitem_price_type__del_field_estimate_bank_n	2014-12-21 11:43:20.65223+05:30
76	sales	0018_auto__add_field_sale_deliverynote	2014-12-21 11:43:20.7872+05:30
77	sales	0019_auto__add_field_deliverynote_is_converted	2014-12-21 11:43:21.125083+05:30
78	sales	0020_auto__add_field_estimateitem_price_type	2014-12-21 11:43:21.206578+05:30
79	sales	0021_auto__del_field_salesitem_quantity_in_purchase_unit__del_field_salesit	2014-12-21 11:43:21.297578+05:30
80	inventory	0016_auto__add_field_item_room_number__add_field_item_shelf_number	2014-12-21 11:43:45.141578+05:30
\.


--
-- Name: south_migrationhistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('south_migrationhistory_id_seq', 80, true);


--
-- Data for Name: suppliers_supplier; Type: TABLE DATA; Schema: public; Owner: remya
--

COPY suppliers_supplier (id, ledger_id, name, address, email, contact_no, credit_period, credit_period_parameter) FROM stdin;
\.


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: remya
--

SELECT pg_catalog.setval('suppliers_supplier_id_seq', 1, false);


--
-- Name: accounts_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY accounts_ledger
    ADD CONSTRAINT accounts_ledger_pkey PRIMARY KEY (id);


--
-- Name: accounts_ledgerentry_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY accounts_ledgerentry
    ADD CONSTRAINT accounts_ledgerentry_pkey PRIMARY KEY (id);


--
-- Name: accounts_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY accounts_transaction
    ADD CONSTRAINT accounts_transaction_pkey PRIMARY KEY (id);


--
-- Name: administration_bonuspoint_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY administration_bonuspoint
    ADD CONSTRAINT administration_bonuspoint_pkey PRIMARY KEY (id);


--
-- Name: administration_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY administration_permission
    ADD CONSTRAINT administration_permission_pkey PRIMARY KEY (id);


--
-- Name: administration_salesman_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY administration_salesman
    ADD CONSTRAINT administration_salesman_pkey PRIMARY KEY (id);


--
-- Name: administration_serialnobill_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY administration_serialnobill
    ADD CONSTRAINT administration_serialnobill_pkey PRIMARY KEY (id);


--
-- Name: administration_serialnoinvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY administration_serialnoinvoice
    ADD CONSTRAINT administration_serialnoinvoice_pkey PRIMARY KEY (id);


--
-- Name: administration_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY administration_staff
    ADD CONSTRAINT administration_staff_pkey PRIMARY KEY (id);


--
-- Name: auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions_group_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_key UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission_content_type_id_codename_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_key UNIQUE (content_type_id, codename);


--
-- Name: auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups_user_id_group_id_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_key UNIQUE (user_id, group_id);


--
-- Name: auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions_user_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_key UNIQUE (user_id, permission_id);


--
-- Name: auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- Name: customers_customer_name_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY customers_customer
    ADD CONSTRAINT customers_customer_name_key UNIQUE (name);


--
-- Name: customers_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY customers_customer
    ADD CONSTRAINT customers_customer_pkey PRIMARY KEY (id);


--
-- Name: dashboard_postdatedcheque_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY dashboard_postdatedcheque
    ADD CONSTRAINT dashboard_postdatedcheque_pkey PRIMARY KEY (id);


--
-- Name: dashboard_stockquantityaler_stockquantityalert_id_70fb9f6d_uniq; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY dashboard_stockquantityalert_batch_items
    ADD CONSTRAINT dashboard_stockquantityaler_stockquantityalert_id_70fb9f6d_uniq UNIQUE (stockquantityalert_id, batchitem_id);


--
-- Name: dashboard_stockquantityalert_batch_items_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY dashboard_stockquantityalert_batch_items
    ADD CONSTRAINT dashboard_stockquantityalert_batch_items_pkey PRIMARY KEY (id);


--
-- Name: dashboard_stockquantityalert_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY dashboard_stockquantityalert
    ADD CONSTRAINT dashboard_stockquantityalert_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type_app_label_model_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_key UNIQUE (app_label, model);


--
-- Name: django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: django_site_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY django_site
    ADD CONSTRAINT django_site_pkey PRIMARY KEY (id);


--
-- Name: inventory_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_batch
    ADD CONSTRAINT inventory_batch_pkey PRIMARY KEY (id);


--
-- Name: inventory_batchitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_batchitem
    ADD CONSTRAINT inventory_batchitem_pkey PRIMARY KEY (id);


--
-- Name: inventory_brand_name_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_brand
    ADD CONSTRAINT inventory_brand_name_key UNIQUE (name);


--
-- Name: inventory_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_brand
    ADD CONSTRAINT inventory_brand_pkey PRIMARY KEY (id);


--
-- Name: inventory_category_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_category
    ADD CONSTRAINT inventory_category_pkey PRIMARY KEY (id);


--
-- Name: inventory_item_code_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_item
    ADD CONSTRAINT inventory_item_code_key UNIQUE (code);


--
-- Name: inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_item
    ADD CONSTRAINT inventory_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_openingstock_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_openingstock
    ADD CONSTRAINT inventory_openingstock_pkey PRIMARY KEY (id);


--
-- Name: inventory_openingstockitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_openingstockitem
    ADD CONSTRAINT inventory_openingstockitem_pkey PRIMARY KEY (id);


--
-- Name: inventory_openingstockvalue_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_openingstockvalue
    ADD CONSTRAINT inventory_openingstockvalue_pkey PRIMARY KEY (id);


--
-- Name: inventory_product_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_product
    ADD CONSTRAINT inventory_product_pkey PRIMARY KEY (id);


--
-- Name: inventory_stockvalue_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_stockvalue
    ADD CONSTRAINT inventory_stockvalue_pkey PRIMARY KEY (id);


--
-- Name: inventory_vattype_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY inventory_vattype
    ADD CONSTRAINT inventory_vattype_pkey PRIMARY KEY (id);


--
-- Name: purchases_freightvalue_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_freightvalue
    ADD CONSTRAINT purchases_freightvalue_pkey PRIMARY KEY (id);


--
-- Name: purchases_purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_purchase
    ADD CONSTRAINT purchases_purchase_pkey PRIMARY KEY (id);


--
-- Name: purchases_purchase_purchase_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_purchase
    ADD CONSTRAINT purchases_purchase_purchase_invoice_number_key UNIQUE (purchase_invoice_number);


--
-- Name: purchases_purchaseitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_purchaseitem
    ADD CONSTRAINT purchases_purchaseitem_pkey PRIMARY KEY (id);


--
-- Name: purchases_purchasereturn_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_purchasereturn
    ADD CONSTRAINT purchases_purchasereturn_pkey PRIMARY KEY (id);


--
-- Name: purchases_purchasereturn_return_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_purchasereturn
    ADD CONSTRAINT purchases_purchasereturn_return_invoice_number_key UNIQUE (return_invoice_number);


--
-- Name: purchases_purchasereturnitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY purchases_purchasereturnitem
    ADD CONSTRAINT purchases_purchasereturnitem_pkey PRIMARY KEY (id);


--
-- Name: sales_deliverynote_auto_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_deliverynote
    ADD CONSTRAINT sales_deliverynote_auto_invoice_number_key UNIQUE (auto_invoice_number);


--
-- Name: sales_deliverynote_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_deliverynote
    ADD CONSTRAINT sales_deliverynote_pkey PRIMARY KEY (id);


--
-- Name: sales_deliverynoteitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_deliverynoteitem
    ADD CONSTRAINT sales_deliverynoteitem_pkey PRIMARY KEY (id);


--
-- Name: sales_editedinvoice_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_editedinvoice
    ADD CONSTRAINT sales_editedinvoice_invoice_no_key UNIQUE (invoice_no);


--
-- Name: sales_editedinvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_editedinvoice
    ADD CONSTRAINT sales_editedinvoice_pkey PRIMARY KEY (id);


--
-- Name: sales_editedinvoicesale_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_editedinvoicesale
    ADD CONSTRAINT sales_editedinvoicesale_pkey PRIMARY KEY (id);


--
-- Name: sales_editedinvoicesaleitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_editedinvoicesaleitem
    ADD CONSTRAINT sales_editedinvoicesaleitem_pkey PRIMARY KEY (id);


--
-- Name: sales_editedreceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_editedreceipt
    ADD CONSTRAINT sales_editedreceipt_pkey PRIMARY KEY (id);


--
-- Name: sales_editedreceipt_receipt_no_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_editedreceipt
    ADD CONSTRAINT sales_editedreceipt_receipt_no_key UNIQUE (receipt_no);


--
-- Name: sales_estimate_auto_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_estimate
    ADD CONSTRAINT sales_estimate_auto_invoice_number_key UNIQUE (auto_invoice_number);


--
-- Name: sales_estimate_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_estimate
    ADD CONSTRAINT sales_estimate_pkey PRIMARY KEY (id);


--
-- Name: sales_estimateitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_estimateitem
    ADD CONSTRAINT sales_estimateitem_pkey PRIMARY KEY (id);


--
-- Name: sales_invoice_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_invoice
    ADD CONSTRAINT sales_invoice_invoice_no_key UNIQUE (invoice_no);


--
-- Name: sales_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_invoice
    ADD CONSTRAINT sales_invoice_pkey PRIMARY KEY (id);


--
-- Name: sales_receipt_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_receipt
    ADD CONSTRAINT sales_receipt_pkey PRIMARY KEY (id);


--
-- Name: sales_receipt_receipt_no_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_receipt
    ADD CONSTRAINT sales_receipt_receipt_no_key UNIQUE (receipt_no);


--
-- Name: sales_sale_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_sale
    ADD CONSTRAINT sales_sale_pkey PRIMARY KEY (id);


--
-- Name: sales_salesitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_salesitem
    ADD CONSTRAINT sales_salesitem_pkey PRIMARY KEY (id);


--
-- Name: sales_salesreturn_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_salesreturn
    ADD CONSTRAINT sales_salesreturn_pkey PRIMARY KEY (id);


--
-- Name: sales_salesreturn_return_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_salesreturn
    ADD CONSTRAINT sales_salesreturn_return_invoice_number_key UNIQUE (return_invoice_number);


--
-- Name: sales_salesreturnitem_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY sales_salesreturnitem
    ADD CONSTRAINT sales_salesreturnitem_pkey PRIMARY KEY (id);


--
-- Name: south_migrationhistory_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY south_migrationhistory
    ADD CONSTRAINT south_migrationhistory_pkey PRIMARY KEY (id);


--
-- Name: suppliers_supplier_name_key; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY suppliers_supplier
    ADD CONSTRAINT suppliers_supplier_name_key UNIQUE (name);


--
-- Name: suppliers_supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: remya; Tablespace: 
--

ALTER TABLE ONLY suppliers_supplier
    ADD CONSTRAINT suppliers_supplier_pkey PRIMARY KEY (id);


--
-- Name: accounts_ledger_parent_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX accounts_ledger_parent_id ON accounts_ledger USING btree (parent_id);


--
-- Name: accounts_ledgerentry_ledger_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX accounts_ledgerentry_ledger_id ON accounts_ledgerentry USING btree (ledger_id);


--
-- Name: accounts_transaction_credit_ledger_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX accounts_transaction_credit_ledger_id ON accounts_transaction USING btree (credit_ledger_id);


--
-- Name: accounts_transaction_debit_ledger_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX accounts_transaction_debit_ledger_id ON accounts_transaction USING btree (debit_ledger_id);


--
-- Name: administration_serialnobill_user_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX administration_serialnobill_user_id ON administration_serialnobill USING btree (user_id);


--
-- Name: administration_serialnoinvoice_user_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX administration_serialnoinvoice_user_id ON administration_serialnoinvoice USING btree (user_id);


--
-- Name: administration_staff_permission_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX administration_staff_permission_id ON administration_staff USING btree (permission_id);


--
-- Name: administration_staff_user_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX administration_staff_user_id ON administration_staff USING btree (user_id);


--
-- Name: auth_group_name_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_group_name_like ON auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_group_permissions_group_id ON auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_group_permissions_permission_id ON auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_permission_content_type_id ON auth_permission USING btree (content_type_id);


--
-- Name: auth_user_groups_group_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_user_groups_group_id ON auth_user_groups USING btree (group_id);


--
-- Name: auth_user_groups_user_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_user_groups_user_id ON auth_user_groups USING btree (user_id);


--
-- Name: auth_user_user_permissions_permission_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_user_user_permissions_permission_id ON auth_user_user_permissions USING btree (permission_id);


--
-- Name: auth_user_user_permissions_user_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_user_user_permissions_user_id ON auth_user_user_permissions USING btree (user_id);


--
-- Name: auth_user_username_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX auth_user_username_like ON auth_user USING btree (username varchar_pattern_ops);


--
-- Name: customers_customer_ledger_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX customers_customer_ledger_id ON customers_customer USING btree (ledger_id);


--
-- Name: customers_customer_name_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX customers_customer_name_like ON customers_customer USING btree (name varchar_pattern_ops);


--
-- Name: dashboard_stockquantityalert_batch_items_batchitem_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX dashboard_stockquantityalert_batch_items_batchitem_id ON dashboard_stockquantityalert_batch_items USING btree (batchitem_id);


--
-- Name: dashboard_stockquantityalert_batch_items_stockquantityalert_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX dashboard_stockquantityalert_batch_items_stockquantityalert_id ON dashboard_stockquantityalert_batch_items USING btree (stockquantityalert_id);


--
-- Name: django_admin_log_content_type_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX django_admin_log_content_type_id ON django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX django_admin_log_user_id ON django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX django_session_expire_date ON django_session USING btree (expire_date);


--
-- Name: django_session_session_key_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX django_session_session_key_like ON django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: inventory_batchitem_batch_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_batchitem_batch_id ON inventory_batchitem USING btree (batch_id);


--
-- Name: inventory_batchitem_customer_bonus_points_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_batchitem_customer_bonus_points_id ON inventory_batchitem USING btree (customer_bonus_points_id);


--
-- Name: inventory_batchitem_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_batchitem_item_id ON inventory_batchitem USING btree (item_id);


--
-- Name: inventory_batchitem_salesman_bonus_points_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_batchitem_salesman_bonus_points_id ON inventory_batchitem USING btree (salesman_bonus_points_id);


--
-- Name: inventory_brand_name_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_brand_name_like ON inventory_brand USING btree (name varchar_pattern_ops);


--
-- Name: inventory_category_parent_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_category_parent_id ON inventory_category USING btree (parent_id);


--
-- Name: inventory_item_brand_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_item_brand_id ON inventory_item USING btree (brand_id);


--
-- Name: inventory_item_code_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_item_code_like ON inventory_item USING btree (code varchar_pattern_ops);


--
-- Name: inventory_item_product_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_item_product_id ON inventory_item USING btree (product_id);


--
-- Name: inventory_item_vat_type_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_item_vat_type_id ON inventory_item USING btree (vat_type_id);


--
-- Name: inventory_openingstockitem_batch_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_openingstockitem_batch_item_id ON inventory_openingstockitem USING btree (batch_item_id);


--
-- Name: inventory_openingstockitem_opening_stock_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_openingstockitem_opening_stock_id ON inventory_openingstockitem USING btree (opening_stock_id);


--
-- Name: inventory_product_category_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX inventory_product_category_id ON inventory_product USING btree (category_id);


--
-- Name: purchases_purchase_purchase_invoice_number_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchase_purchase_invoice_number_like ON purchases_purchase USING btree (purchase_invoice_number varchar_pattern_ops);


--
-- Name: purchases_purchase_supplier_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchase_supplier_id ON purchases_purchase USING btree (supplier_id);


--
-- Name: purchases_purchaseitem_batch_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchaseitem_batch_item_id ON purchases_purchaseitem USING btree (batch_item_id);


--
-- Name: purchases_purchaseitem_purchase_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchaseitem_purchase_id ON purchases_purchaseitem USING btree (purchase_id);


--
-- Name: purchases_purchasereturn_purchase_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchasereturn_purchase_id ON purchases_purchasereturn USING btree (purchase_id);


--
-- Name: purchases_purchasereturn_return_invoice_number_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchasereturn_return_invoice_number_like ON purchases_purchasereturn USING btree (return_invoice_number varchar_pattern_ops);


--
-- Name: purchases_purchasereturnitem_purchase_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchasereturnitem_purchase_item_id ON purchases_purchasereturnitem USING btree (purchase_item_id);


--
-- Name: purchases_purchasereturnitem_purchase_return_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX purchases_purchasereturnitem_purchase_return_id ON purchases_purchasereturnitem USING btree (purchase_return_id);


--
-- Name: sales_deliverynote_auto_invoice_number_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_deliverynote_auto_invoice_number_like ON sales_deliverynote USING btree (auto_invoice_number varchar_pattern_ops);


--
-- Name: sales_deliverynote_customer_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_deliverynote_customer_id ON sales_deliverynote USING btree (customer_id);


--
-- Name: sales_deliverynote_salesman_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_deliverynote_salesman_id ON sales_deliverynote USING btree (salesman_id);


--
-- Name: sales_deliverynoteitem_batch_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_deliverynoteitem_batch_item_id ON sales_deliverynoteitem USING btree (batch_item_id);


--
-- Name: sales_deliverynoteitem_delivery_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_deliverynoteitem_delivery_id ON sales_deliverynoteitem USING btree (delivery_id);


--
-- Name: sales_deliverynoteitem_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_deliverynoteitem_item_id ON sales_deliverynoteitem USING btree (item_id);


--
-- Name: sales_editedinvoice_edited_invoice_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoice_edited_invoice_sales_id ON sales_editedinvoice USING btree (edited_invoice_sales_id);


--
-- Name: sales_editedinvoice_invoice_no_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoice_invoice_no_like ON sales_editedinvoice USING btree (invoice_no varchar_pattern_ops);


--
-- Name: sales_editedinvoicesale_created_by_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoicesale_created_by_id ON sales_editedinvoicesale USING btree (created_by_id);


--
-- Name: sales_editedinvoicesale_customer_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoicesale_customer_id ON sales_editedinvoicesale USING btree (customer_id);


--
-- Name: sales_editedinvoicesale_salesman_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoicesale_salesman_id ON sales_editedinvoicesale USING btree (salesman_id);


--
-- Name: sales_editedinvoicesaleitem_batch_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoicesaleitem_batch_item_id ON sales_editedinvoicesaleitem USING btree (batch_item_id);


--
-- Name: sales_editedinvoicesaleitem_edited_invoice_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoicesaleitem_edited_invoice_sales_id ON sales_editedinvoicesaleitem USING btree (edited_invoice_sales_id);


--
-- Name: sales_editedinvoicesaleitem_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedinvoicesaleitem_item_id ON sales_editedinvoicesaleitem USING btree (item_id);


--
-- Name: sales_editedreceipt_edited_invoice_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedreceipt_edited_invoice_sales_id ON sales_editedreceipt USING btree (edited_invoice_sales_id);


--
-- Name: sales_editedreceipt_receipt_no_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_editedreceipt_receipt_no_like ON sales_editedreceipt USING btree (receipt_no varchar_pattern_ops);


--
-- Name: sales_estimate_auto_invoice_number_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_estimate_auto_invoice_number_like ON sales_estimate USING btree (auto_invoice_number varchar_pattern_ops);


--
-- Name: sales_estimate_customer_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_estimate_customer_id ON sales_estimate USING btree (customer_id);


--
-- Name: sales_estimate_salesman_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_estimate_salesman_id ON sales_estimate USING btree (salesman_id);


--
-- Name: sales_estimateitem_batch_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_estimateitem_batch_item_id ON sales_estimateitem USING btree (batch_item_id);


--
-- Name: sales_estimateitem_estimate_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_estimateitem_estimate_id ON sales_estimateitem USING btree (estimate_id);


--
-- Name: sales_estimateitem_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_estimateitem_item_id ON sales_estimateitem USING btree (item_id);


--
-- Name: sales_invoice_invoice_no_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_invoice_invoice_no_like ON sales_invoice USING btree (invoice_no varchar_pattern_ops);


--
-- Name: sales_invoice_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_invoice_sales_id ON sales_invoice USING btree (sales_id);


--
-- Name: sales_receipt_receipt_no_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_receipt_receipt_no_like ON sales_receipt USING btree (receipt_no varchar_pattern_ops);


--
-- Name: sales_receipt_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_receipt_sales_id ON sales_receipt USING btree (sales_id);


--
-- Name: sales_sale_created_by_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_sale_created_by_id ON sales_sale USING btree (created_by_id);


--
-- Name: sales_sale_customer_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_sale_customer_id ON sales_sale USING btree (customer_id);


--
-- Name: sales_sale_deliverynote_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_sale_deliverynote_id ON sales_sale USING btree (deliverynote_id);


--
-- Name: sales_sale_salesman_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_sale_salesman_id ON sales_sale USING btree (salesman_id);


--
-- Name: sales_salesitem_batch_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesitem_batch_item_id ON sales_salesitem USING btree (batch_item_id);


--
-- Name: sales_salesitem_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesitem_item_id ON sales_salesitem USING btree (item_id);


--
-- Name: sales_salesitem_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesitem_sales_id ON sales_salesitem USING btree (sales_id);


--
-- Name: sales_salesreturn_return_invoice_number_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesreturn_return_invoice_number_like ON sales_salesreturn USING btree (return_invoice_number varchar_pattern_ops);


--
-- Name: sales_salesreturn_sales_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesreturn_sales_id ON sales_salesreturn USING btree (sales_id);


--
-- Name: sales_salesreturnitem_sales_item_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesreturnitem_sales_item_id ON sales_salesreturnitem USING btree (sales_item_id);


--
-- Name: sales_salesreturnitem_sales_return_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX sales_salesreturnitem_sales_return_id ON sales_salesreturnitem USING btree (sales_return_id);


--
-- Name: suppliers_supplier_ledger_id; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX suppliers_supplier_ledger_id ON suppliers_supplier USING btree (ledger_id);


--
-- Name: suppliers_supplier_name_like; Type: INDEX; Schema: public; Owner: remya; Tablespace: 
--

CREATE INDEX suppliers_supplier_name_like ON suppliers_supplier USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_id_refs_id_6b74a262; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_batchitem
    ADD CONSTRAINT batch_id_refs_id_6b74a262 FOREIGN KEY (batch_id) REFERENCES inventory_batch(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_item_id_refs_id_2275f468; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesaleitem
    ADD CONSTRAINT batch_item_id_refs_id_2275f468 FOREIGN KEY (batch_item_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_item_id_refs_id_251c766f; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchaseitem
    ADD CONSTRAINT batch_item_id_refs_id_251c766f FOREIGN KEY (batch_item_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_item_id_refs_id_50e47f04; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimateitem
    ADD CONSTRAINT batch_item_id_refs_id_50e47f04 FOREIGN KEY (batch_item_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_item_id_refs_id_5d29dbc4; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_openingstockitem
    ADD CONSTRAINT batch_item_id_refs_id_5d29dbc4 FOREIGN KEY (batch_item_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_item_id_refs_id_71020c39; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesitem
    ADD CONSTRAINT batch_item_id_refs_id_71020c39 FOREIGN KEY (batch_item_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batch_item_id_refs_id_d32e68e; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynoteitem
    ADD CONSTRAINT batch_item_id_refs_id_d32e68e FOREIGN KEY (batch_item_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: batchitem_id_refs_id_756ee4bc; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY dashboard_stockquantityalert_batch_items
    ADD CONSTRAINT batchitem_id_refs_id_756ee4bc FOREIGN KEY (batchitem_id) REFERENCES inventory_batchitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: brand_id_refs_id_382f4770; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_item
    ADD CONSTRAINT brand_id_refs_id_382f4770 FOREIGN KEY (brand_id) REFERENCES inventory_brand(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: category_id_refs_id_4207a6e7; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_product
    ADD CONSTRAINT category_id_refs_id_4207a6e7 FOREIGN KEY (category_id) REFERENCES inventory_category(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: content_type_id_refs_id_d043b34a; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_permission
    ADD CONSTRAINT content_type_id_refs_id_d043b34a FOREIGN KEY (content_type_id) REFERENCES django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: created_by_id_refs_id_5f282ee8; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_sale
    ADD CONSTRAINT created_by_id_refs_id_5f282ee8 FOREIGN KEY (created_by_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: created_by_id_refs_id_7585956f; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesale
    ADD CONSTRAINT created_by_id_refs_id_7585956f FOREIGN KEY (created_by_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: credit_ledger_id_refs_id_1154a362; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_transaction
    ADD CONSTRAINT credit_ledger_id_refs_id_1154a362 FOREIGN KEY (credit_ledger_id) REFERENCES accounts_ledgerentry(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: customer_bonus_points_id_refs_id_34d5ce43; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_batchitem
    ADD CONSTRAINT customer_bonus_points_id_refs_id_34d5ce43 FOREIGN KEY (customer_bonus_points_id) REFERENCES administration_bonuspoint(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: customer_id_refs_id_19179fe8; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesale
    ADD CONSTRAINT customer_id_refs_id_19179fe8 FOREIGN KEY (customer_id) REFERENCES customers_customer(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: customer_id_refs_id_2cb4e23e; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynote
    ADD CONSTRAINT customer_id_refs_id_2cb4e23e FOREIGN KEY (customer_id) REFERENCES customers_customer(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: customer_id_refs_id_5a49a5c1; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_sale
    ADD CONSTRAINT customer_id_refs_id_5a49a5c1 FOREIGN KEY (customer_id) REFERENCES customers_customer(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: customer_id_refs_id_60ff3464; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimate
    ADD CONSTRAINT customer_id_refs_id_60ff3464 FOREIGN KEY (customer_id) REFERENCES customers_customer(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: debit_ledger_id_refs_id_1154a362; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_transaction
    ADD CONSTRAINT debit_ledger_id_refs_id_1154a362 FOREIGN KEY (debit_ledger_id) REFERENCES accounts_ledgerentry(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: delivery_id_refs_id_49c57778; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynoteitem
    ADD CONSTRAINT delivery_id_refs_id_49c57778 FOREIGN KEY (delivery_id) REFERENCES sales_deliverynote(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: deliverynote_id_refs_id_793a4c7c; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_sale
    ADD CONSTRAINT deliverynote_id_refs_id_793a4c7c FOREIGN KEY (deliverynote_id) REFERENCES sales_deliverynote(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log_content_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_fkey FOREIGN KEY (content_type_id) REFERENCES django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: edited_invoice_sales_id_refs_id_30e18d64; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesaleitem
    ADD CONSTRAINT edited_invoice_sales_id_refs_id_30e18d64 FOREIGN KEY (edited_invoice_sales_id) REFERENCES sales_editedinvoicesale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: edited_invoice_sales_id_refs_id_3c3958f3; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedreceipt
    ADD CONSTRAINT edited_invoice_sales_id_refs_id_3c3958f3 FOREIGN KEY (edited_invoice_sales_id) REFERENCES sales_editedinvoicesale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: edited_invoice_sales_id_refs_id_585cb8; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoice
    ADD CONSTRAINT edited_invoice_sales_id_refs_id_585cb8 FOREIGN KEY (edited_invoice_sales_id) REFERENCES sales_editedinvoicesale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: estimate_id_refs_id_75ba25ac; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimateitem
    ADD CONSTRAINT estimate_id_refs_id_75ba25ac FOREIGN KEY (estimate_id) REFERENCES sales_estimate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: group_id_refs_id_f4b32aac; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT group_id_refs_id_f4b32aac FOREIGN KEY (group_id) REFERENCES auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: item_id_refs_id_13435e14; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesitem
    ADD CONSTRAINT item_id_refs_id_13435e14 FOREIGN KEY (item_id) REFERENCES inventory_item(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: item_id_refs_id_1e814e99; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynoteitem
    ADD CONSTRAINT item_id_refs_id_1e814e99 FOREIGN KEY (item_id) REFERENCES inventory_item(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: item_id_refs_id_331cd948; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_batchitem
    ADD CONSTRAINT item_id_refs_id_331cd948 FOREIGN KEY (item_id) REFERENCES inventory_item(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: item_id_refs_id_742830f1; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimateitem
    ADD CONSTRAINT item_id_refs_id_742830f1 FOREIGN KEY (item_id) REFERENCES inventory_item(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: item_id_refs_id_af6e725; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesaleitem
    ADD CONSTRAINT item_id_refs_id_af6e725 FOREIGN KEY (item_id) REFERENCES inventory_item(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: ledger_id_refs_id_1716027e; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY customers_customer
    ADD CONSTRAINT ledger_id_refs_id_1716027e FOREIGN KEY (ledger_id) REFERENCES accounts_ledger(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: ledger_id_refs_id_42560c9e; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_ledgerentry
    ADD CONSTRAINT ledger_id_refs_id_42560c9e FOREIGN KEY (ledger_id) REFERENCES accounts_ledger(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: ledger_id_refs_id_477be5ea; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY suppliers_supplier
    ADD CONSTRAINT ledger_id_refs_id_477be5ea FOREIGN KEY (ledger_id) REFERENCES accounts_ledger(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: opening_stock_id_refs_id_435abc34; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_openingstockitem
    ADD CONSTRAINT opening_stock_id_refs_id_435abc34 FOREIGN KEY (opening_stock_id) REFERENCES inventory_openingstock(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: parent_id_refs_id_1e7f3ebd; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY accounts_ledger
    ADD CONSTRAINT parent_id_refs_id_1e7f3ebd FOREIGN KEY (parent_id) REFERENCES accounts_ledger(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: parent_id_refs_id_73ffda85; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_category
    ADD CONSTRAINT parent_id_refs_id_73ffda85 FOREIGN KEY (parent_id) REFERENCES inventory_category(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: permission_id_refs_id_3a2f38b1; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_staff
    ADD CONSTRAINT permission_id_refs_id_3a2f38b1 FOREIGN KEY (permission_id) REFERENCES administration_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: product_id_refs_id_4972c410; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_item
    ADD CONSTRAINT product_id_refs_id_4972c410 FOREIGN KEY (product_id) REFERENCES inventory_product(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: purchase_id_refs_id_44dd9e1d; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchasereturn
    ADD CONSTRAINT purchase_id_refs_id_44dd9e1d FOREIGN KEY (purchase_id) REFERENCES purchases_purchase(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: purchase_id_refs_id_665fee0e; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchaseitem
    ADD CONSTRAINT purchase_id_refs_id_665fee0e FOREIGN KEY (purchase_id) REFERENCES purchases_purchase(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: purchase_item_id_refs_id_7aa2a59d; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchasereturnitem
    ADD CONSTRAINT purchase_item_id_refs_id_7aa2a59d FOREIGN KEY (purchase_item_id) REFERENCES purchases_purchaseitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: purchase_return_id_refs_id_68e4e6ae; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchasereturnitem
    ADD CONSTRAINT purchase_return_id_refs_id_68e4e6ae FOREIGN KEY (purchase_return_id) REFERENCES purchases_purchasereturn(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: sales_id_refs_id_5be8b15c; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesitem
    ADD CONSTRAINT sales_id_refs_id_5be8b15c FOREIGN KEY (sales_id) REFERENCES sales_sale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: sales_id_refs_id_6487a54e; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_invoice
    ADD CONSTRAINT sales_id_refs_id_6487a54e FOREIGN KEY (sales_id) REFERENCES sales_sale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: sales_id_refs_id_72ef785d; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesreturn
    ADD CONSTRAINT sales_id_refs_id_72ef785d FOREIGN KEY (sales_id) REFERENCES sales_sale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: sales_id_refs_id_7bafcd37; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_receipt
    ADD CONSTRAINT sales_id_refs_id_7bafcd37 FOREIGN KEY (sales_id) REFERENCES sales_sale(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: sales_item_id_refs_id_2bef21fb; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesreturnitem
    ADD CONSTRAINT sales_item_id_refs_id_2bef21fb FOREIGN KEY (sales_item_id) REFERENCES sales_salesitem(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: sales_return_id_refs_id_71cd2d0a; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_salesreturnitem
    ADD CONSTRAINT sales_return_id_refs_id_71cd2d0a FOREIGN KEY (sales_return_id) REFERENCES sales_salesreturn(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: salesman_bonus_points_id_refs_id_34d5ce43; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_batchitem
    ADD CONSTRAINT salesman_bonus_points_id_refs_id_34d5ce43 FOREIGN KEY (salesman_bonus_points_id) REFERENCES administration_bonuspoint(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: salesman_id_refs_id_121500b9; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_sale
    ADD CONSTRAINT salesman_id_refs_id_121500b9 FOREIGN KEY (salesman_id) REFERENCES administration_salesman(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: salesman_id_refs_id_2521d262; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_editedinvoicesale
    ADD CONSTRAINT salesman_id_refs_id_2521d262 FOREIGN KEY (salesman_id) REFERENCES administration_salesman(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: salesman_id_refs_id_2f8a25c8; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_deliverynote
    ADD CONSTRAINT salesman_id_refs_id_2f8a25c8 FOREIGN KEY (salesman_id) REFERENCES administration_salesman(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: salesman_id_refs_id_31c69922; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY sales_estimate
    ADD CONSTRAINT salesman_id_refs_id_31c69922 FOREIGN KEY (salesman_id) REFERENCES administration_salesman(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: stockquantityalert_id_refs_id_157723f; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY dashboard_stockquantityalert_batch_items
    ADD CONSTRAINT stockquantityalert_id_refs_id_157723f FOREIGN KEY (stockquantityalert_id) REFERENCES dashboard_stockquantityalert(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: supplier_id_refs_id_6a4a3365; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY purchases_purchase
    ADD CONSTRAINT supplier_id_refs_id_6a4a3365 FOREIGN KEY (supplier_id) REFERENCES suppliers_supplier(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_id_refs_id_40c41112; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user_groups
    ADD CONSTRAINT user_id_refs_id_40c41112 FOREIGN KEY (user_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_id_refs_id_4dc23c39; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY auth_user_user_permissions
    ADD CONSTRAINT user_id_refs_id_4dc23c39 FOREIGN KEY (user_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_id_refs_id_5a70d3e8; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_serialnobill
    ADD CONSTRAINT user_id_refs_id_5a70d3e8 FOREIGN KEY (user_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_id_refs_id_5dd114d; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_staff
    ADD CONSTRAINT user_id_refs_id_5dd114d FOREIGN KEY (user_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_id_refs_id_6f2355bb; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY administration_serialnoinvoice
    ADD CONSTRAINT user_id_refs_id_6f2355bb FOREIGN KEY (user_id) REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: vat_type_id_refs_id_63735690; Type: FK CONSTRAINT; Schema: public; Owner: remya
--

ALTER TABLE ONLY inventory_item
    ADD CONSTRAINT vat_type_id_refs_id_63735690 FOREIGN KEY (vat_type_id) REFERENCES inventory_vattype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

