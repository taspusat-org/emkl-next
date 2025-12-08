-- ===========================================
-- INSERT QUERIES FOR CONSIGNEE TABLES
-- ===========================================

-- 1. INSERT INTO consignee
INSERT INTO consignee (
    id,
    shipper_id,
    namaconsignee,
    tujuankapal_id,
    info,
    modifiedby,
    created_at,
    updated_at
) VALUES (
    1,                    -- id (bigint)
    1001,                 -- shipper_id (bigint)
    'PT. ABC CONSIGNEE',  -- namaconsignee (nvarchar(max))
    2001,                 -- tujuankapal_id (bigint)
    'Informasi consignee', -- info (nvarchar(max))
    'admin',              -- modifiedby (varchar(200))
    GETDATE(),            -- created_at (datetime)
    GETDATE()             -- updated_at (datetime)
);

-- 2. INSERT INTO consigneedetail
INSERT INTO consigneedetail (
    id,
    consignee_id,
    keterangan,
    info,
    modifiedby,
    created_at,
    updated_at
) VALUES (
    1,                    -- id (bigint)
    1,                    -- consignee_id (bigint)
    'Detail keterangan consignee', -- keterangan (nvarchar(max))
    'Informasi detail',   -- info (nvarchar(max))
    'admin',              -- modifiedby (varchar(200))
    GETDATE(),            -- created_at (datetime)
    GETDATE()             -- updated_at (datetime)
);

-- 3. INSERT INTO consigneebiaya
INSERT INTO consigneebiaya (
    id,
    consignee_id,
    biayaemkl_id,
    link_id,
    container_id,
    emkl_id,
    nominalasuransi,
    nominal,
    info,
    modifiedby,
    created_at,
    updated_at
) VALUES (
    1,                    -- id (bigint)
    1,                    -- consignee_id (bigint)
    3001,                 -- biayaemkl_id (bigint)
    4001,                 -- link_id (bigint)
    5001,                 -- container_id (bigint)
    6001,                 -- emkl_id (bigint)
    1000000.00,           -- nominalasuransi (money)
    500000.00,            -- nominal (money)
    'Biaya asuransi consignee', -- info (nvarchar(max))
    'admin',              -- modifiedby (varchar(200))
    GETDATE(),            -- created_at (datetime)
    GETDATE()             -- updated_at (datetime)
);

-- 4. INSERT INTO consigneehargajual
INSERT INTO consigneehargajual (
    id,
    consignee_id,
    container_id,
    nominal,
    info,
    modifiedby,
    created_at,
    updated_at
) VALUES (
    1,                    -- id (bigint)
    1,                    -- consignee_id (bigint)
    5001,                 -- container_id (bigint)
    1500000,              -- nominal (bigint)
    'Harga jual consignee', -- info (nvarchar(max))
    'admin',              -- modifiedby (varchar(200))
    GETDATE(),            -- created_at (datetime)
    GETDATE()             -- updated_at (datetime)
);

-- ===========================================
-- BULK INSERT EXAMPLE (Multiple Records)
-- ===========================================

-- Bulk insert untuk consignee
INSERT INTO consignee (id, shipper_id, namaconsignee, tujuankapal_id, info, modifiedby, created_at, updated_at)
VALUES
(2, 1002, 'PT. XYZ CONSIGNEE', 2002, 'Info consignee 2', 'admin', GETDATE(), GETDATE()),
(3, 1003, 'CV. DEF CONSIGNEE', 2003, 'Info consignee 3', 'admin', GETDATE(), GETDATE()),
(4, 1004, 'PT. GHI CONSIGNEE', 2004, 'Info consignee 4', 'admin', GETDATE(), GETDATE());

-- Bulk insert untuk consigneedetail
INSERT INTO consigneedetail (id, consignee_id, keterangan, info, modifiedby, created_at, updated_at)
VALUES
(2, 2, 'Detail consignee 2', 'Info detail 2', 'admin', GETDATE(), GETDATE()),
(3, 3, 'Detail consignee 3', 'Info detail 3', 'admin', GETDATE(), GETDATE()),
(4, 4, 'Detail consignee 4', 'Info detail 4', 'admin', GETDATE(), GETDATE());

-- Bulk insert untuk consigneebiaya
INSERT INTO consigneebiaya (id, consignee_id, biayaemkl_id, link_id, container_id, emkl_id, nominalasuransi, nominal, info, modifiedby, created_at, updated_at)
VALUES
(2, 2, 3002, 4002, 5002, 6002, 2000000.00, 750000.00, 'Biaya asuransi 2', 'admin', GETDATE(), GETDATE()),
(3, 3, 3003, 4003, 5003, 6003, 3000000.00, 1000000.00, 'Biaya asuransi 3', 'admin', GETDATE(), GETDATE()),
(4, 4, 3004, 4004, 5004, 6004, 1500000.00, 600000.00, 'Biaya asuransi 4', 'admin', GETDATE(), GETDATE());

-- Bulk insert untuk consigneehargajual
INSERT INTO consigneehargajual (id, consignee_id, container_id, nominal, info, modifiedby, created_at, updated_at)
VALUES
(2, 2, 5002, 2000000, 'Harga jual 2', 'admin', GETDATE(), GETDATE()),
(3, 3, 5003, 2500000, 'Harga jual 3', 'admin', GETDATE(), GETDATE()),
(4, 4, 5004, 1800000, 'Harga jual 4', 'admin', GETDATE(), GETDATE());

-- ===========================================
-- SELECT QUERIES TO VERIFY INSERTS
-- ===========================================

-- Check consignee data
SELECT * FROM consignee ORDER BY id;

-- Check consigneedetail data
SELECT * FROM consigneedetail ORDER BY id;

-- Check consigneebiaya data
SELECT * FROM consigneebiaya ORDER BY id;

-- Check consigneehargajual data
SELECT * FROM consigneehargajual ORDER BY id;

-- Join query to see relationships
SELECT 
    c.id as consignee_id,
    c.namaconsignee,
    c.shipper_id,
    cd.keterangan as detail_keterangan,
    cb.nominal as biaya_nominal,
    cb.nominalasuransi,
    chj.nominal as harga_jual
FROM consignee c
LEFT JOIN consigneedetail cd ON c.id = cd.consignee_id
LEFT JOIN consigneebiaya cb ON c.id = cb.consignee_id
LEFT JOIN consigneehargajual chj ON c.id = chj.consignee_id
ORDER BY c.id;
