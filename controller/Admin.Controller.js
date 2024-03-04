import data from '../database/index.js';

const AdminController = {
    createCatalog: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })

            const { password, Priority } = user[0]
            if (Priority !== 0) return res.json({ error: "You are not an admin!" });

            if (inputpassword === password) {
                try {
                    const catalog = await data.query('SELECT * FROM catalog WHERE Catalog_name = ?', [req.body.Catalog_name]);
                    let catalogID;
                    if (catalog[0].length > 0) {
                        catalogID = catalog[0][0].CatalogID;
                    } else {
                        const catalogData = {
                            Catalog_name: req.body.Catalog_name,
                        };
                        const newCatalog = await data.query('INSERT INTO catalog SET ?', catalogData);
                        catalogID = newCatalog[0].insertId;
                    }

                    //subcatalog should in cataog
                    const subcatalog = await data.query('SELECT * FROM subcatalog WHERE SubCatalog_name = ? AND CatalogID = ?', [req.body.SubCatalog_name, catalogID]);
                    console.log(subcatalog);
                    if (subcatalog[0].length > 0) {
                        return res.json({ error: "Subcatalog with the same name and catalog ID already exists!" });
                    } else {
                        const subcatalogData = {
                            SubCatalog_name: req.body.SubCatalog_name,
                            CatalogID: catalogID
                        };
                        const newsubcatalog = await data.query('INSERT INTO subcatalog SET ?', subcatalogData);

                        res.json({ message: 'New subcatalog created successfully!', newsubcatalog });
                    }


                } catch (error) {
                    console.log(error);
                    res.json({
                        error: error.message
                    });
                }
            }
        } catch (error) {
            console.log(error)
            res.json({
                error: error.message
            })
        }
    },
    createProduct: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })

            const { password, Priority } = user[0]
            if (Priority !== 0) return res.json({ error: "You are not an admin!" });

            if (inputpassword === password) {
                try {

                    const catalog = await data.query('SELECT * FROM catalog WHERE Catalog_name = ?', [req.body.Catalog_name]);
                    if (catalog[0].length === 0) {
                        return res.json({ error: "Catalog doesn't exist!" });
                    }
                    const catalogID = catalog[0][0].CatalogID;

                    const subcatalog = await data.query('SELECT * FROM subcatalog WHERE SubCatalog_name = ? AND CatalogID = ?', [req.body.SubCatalog_name, catalogID]);
                    console.log(subcatalog);
                    if (subcatalog[0].length === 0) {
                        return res.json({ error: "Subcatalog doesn't exist!" });
                    }
                    const subcatalogID = subcatalog[0][0].SubCatalogID;
                    const productData = {
                        Product_name: req.body.Product_name,
                        Catalog: catalogID,
                        SubCatalog: subcatalogID,
                        Image: "../images/" + req.body.Product_name,
                    };
                    const product = await data.query('INSERT INTO product SET ?', productData);
                    res.json({ message: 'New product created successfully!', product });
                } catch (error) {
                    console.log(error);
                    res.json({
                        error: error.message
                    });
                }
            } else {
                return res.json({ error: "Wrong password!" })
            }

        } catch (error) {
            console.log(error)
            res.json({
                error: error.message
            })
        }
    },
    AddProdductDetails: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })

            const { password, Priority } = user[0]
            if (Priority !== 0) return res.json({ error: "You are not an admin!" });

            if (inputpassword === password) {
                try {
                    const product = await data.query('SELECT * FROM product WHERE ProductID = ?', [req.body.ProductID]);
                    if (product[0].length === 0) {
                        return res.json({ error: "Product doesn't exist!" });
                    }
                    const productID = product[0][0].ProductID;
                    const productData = {
                        ProductAttributeName: req.body.ProductAttributeName,
                        ProductAttributeValue: req.body.ProductAttributeValue,
                        QuantityofProduct: req.body.QuantityofProduct,
                        Product_price: req.body.Product_price,
                        Product: productID
                    };
                    const detailproduct = await data.query('INSERT INTO productdetail SET ?', productData);
                    res.json({ message: 'New product details added successfully!', detailproduct });
                } catch (error) {
                    console.log(error);
                    res.json({
                        error: error.message
                    });
                }
            } else {
                return res.json({ error: "Wrong password!" })
            }

        } catch (error) {
            console.log(error)
            res.json({
                error: error.message
            })
        }
    }
};


export default AdminController;
