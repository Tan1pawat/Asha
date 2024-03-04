import data from '../database/index.js';
import bcrypt from 'bcrypt';

const UserController = {
    buyProduct: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })

            const { password, uid } = user[0]

            if (!req.body.Order && !req.body.Product) return res.json({ error: "OrderID and ProductID is required!" })

            if (bcrypt.compareSync(inputpassword, password)) {
                try {
                    const orderExists = await data.query('SELECT * FROM `order` WHERE orderID = ?', [req.body.Order]);
                    const productExists = await data.query('SELECT * FROM productDetail WHERE ProductDetailID = ?', [req.body.Product]);
                    if (orderExists[0].length === 0) {
                        return res.json({ error: "Invalid OrderID!" });
                    }

                    if (productExists[0].length === 0) {
                        return res.json({ error: "Invalid ProductDetail!" });
                    }

                    const OrderProduct = {
                        Order: req.body.Order,
                        Product: req.body.Product,
                        QuantityofOrder: req.body.QuantityofOrder,
                        Status: "inOrder"
                    };

                    const orderProduct = await data.query('INSERT INTO orderproduct SET ?', OrderProduct);
                    res.json({ message: 'Product bought successfully!', orderProduct });

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
    CreateOrder: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })

            const { password, uid } = user[0]

            if (bcrypt.compareSync(inputpassword, password)) {
                try {
                    const orderData = {
                        order_price: 0,
                        status: "Pending",
                        datetime: new Date(),
                        userID: uid
                    }
                    const orderID = await data.query('INSERT INTO `order` SET ?', orderData);
                    res.json({ message: 'Order created successfully!', orderID });
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
            
        }
    },
    fillerProduct: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })

            const { password } = user[0]
            if (!req.body.Catalog_name && !req.body.SubCatalog_name && req.body.Product_name) {
                return res.json({ error: "Catalog and SubCatalog are required!" });
            } else if (!req.body.Catalog_name && req.body.SubCatalog_name) {
                return res.json({ error: "Catalog is required!" });
            }
            if (bcrypt.compareSync(inputpassword, password)) {
                try {
                    if(req.body.SubCatalog_name && req.body.Catalog_name&&req.body.Product_name){
                        const productdetail = await data.query('SELECT * FROM productdetail WHERE Product = (SELECT ProductID FROM product WHERE Product_name = ?)', [req.body.Product_name]);
                        res.json({ message: 'Products fetched successfully!', products: productdetail[0] });
                    }else if (req.body.SubCatalog_name && req.body.Catalog_name) {
                        // If SubCatalog_name is provided, return all products in the subcatalog
                        const products = await data.query('SELECT * FROM product WHERE SubCatalog = (SELECT SubCatalogID FROM subcatalog WHERE SubCatalog_name = ?)', [req.body.SubCatalog_name]);
                        res.json({ message: 'Products fetched successfully!', products: products[0] });
                    } else {
                        // If SubCatalog_name is not provided, return all subcatalogs in the catalog
                        const subcatalogs = await data.query('SELECT * FROM subcatalog WHERE CatalogID = (SELECT CatalogID FROM catalog WHERE Catalog_name = ?)', [req.body.Catalog_name]);
                        res.json({ message: 'Subcatalogs fetched successfully!', subcatalogs: subcatalogs[0] });
                    }
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
    purchaseOrder: async (req, res) => {
        try {
            let authHeader = req.headers.authorization;
            authHeader = authHeader.replace('Basic ', '');
            const credentials = Buffer.from(authHeader, 'base64').toString('utf-8');
            const [useremail, inputpassword] = credentials.split(':');
            const [user] = await data.query("select * from users where user_email = ?", [useremail])
            if (!user[0]) return res.json({ error: "Invalid email!" })
            var Summarize = 0
            const { password, uid } = user[0]

            if (bcrypt.compareSync(inputpassword, password)) {
                    
                    if (!req.body.OrderID) return res.json({ error: "OrderID is required!" })

                    const order = await data.query('SELECT * FROM OrderProduct WHERE `Order` = ?', [req.body.OrderID]);
                    if (order[0].length === 0) {
                        return res.json({ error: "Order doesn't exist!" });
                    }
                    try {
                        await data.beginTransaction();
                        const updatedOrder = await Promise.all(order[0].map(async (item) => {
                            const { Product, Order, OrderByProductID, QuantityofOrder } = item;
                            const product = await data.query('SELECT * FROM ProductDetail WHERE ProductDetailID = ?', [Product]);
                            const { QuantityofProduct , Product_price} = product[0][0];
                            // console.log(QuantityofProduct, QuantityofOrder);
                            let updatedQuantity = QuantityofProduct - QuantityofOrder;
                            if (updatedQuantity < 0) {
                                throw new Error("Not enough products in stock!");
                            }
                            else{
                                Summarize += (QuantityofOrder*Product_price)
                                await data.query('UPDATE ProductDetail SET QuantityofProduct = ? WHERE ProductDetailID = ?', [updatedQuantity, Product]);
                                await data.query('UPDATE `order` SET status = "OrderCompleted" WHERE orderID = ?', [Order]);
                                await data.query('UPDATE orderproduct SET Status = "ProductCompleted" WHERE OrderByProductID = ?', [OrderByProductID]);
                            }
                            return { ...item, QuantityofProduct: updatedQuantity };
                        }));
                        await data.commit();
                        res.json({ message: 'Order completed successfully!' , updatedOrder,Summarize});
                    } catch (error) {
                        await data.rollback();
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

export default UserController;