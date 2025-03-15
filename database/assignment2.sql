--1. Insert record to account table
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password,
)
VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

-- 2.Modify Tony Stark record to type = Admin
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- 3.Update description for inventory record for GM Hummer vehicle - id=10
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior ')
WHERE inv_id = 10;


-- 4.Update inventory description from the GM Hummer
UPDATE public.inventory
SET inv_description = REPLACE (inv_description, 'the small interiors', 'a huge interior ')
WHERE inv_id = 10;

-- 5.Inner Join to select make and model from inv.table and classification_name from clas.table where category= Sport
SELECT 
SELECT 
	inventory.inv_make as make,
	inventory.inv_model as model,
	classification.classification_name as classification
FROM public.inventory
	INNER JOIN public.classification
	ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';


--6. Update inventory table inv_image and inv_thumbnail columns from: /images to: /images/vehicles
UPDATE public.inventory
SET inv_image = REPLACE (inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = REPLACE (inv_thumbnail, '/images/', '/images/vehicles/');

