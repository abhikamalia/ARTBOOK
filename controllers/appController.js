const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
// const upload = require('express-fileupload');


let mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'abhi@123',
	database: 'artbook_db'

});

let update_check = false;

mysqlConnection.connect(function(err){
	if (!err) console.log('Database connected ...');
	else console.log(err);
});

let urlencodedParser = bodyParser.urlencoded({extended : false});
let message = "";
module.exports = function(app){
	// app.use(upload());
	app.use(session({secret: 'artbook'}));

	//logout
	app.get('/logout' , function(req , res){
		console.log(`[ ${req.session.username} ] : Logged out...`);
		delete req.session.username;
		res.redirect('/login');
		
	});

	//all orders
	app.get('/all_orders' , function(req , res){
		if(req.session.username){
			let query = 'SELECT * FROM art';
			mysqlConnection.query(query , function(err , rows , fields){
				if(!err){
					let query2 = 'SELECT * FROM cart';
					mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
						if(!err2){
							let query3 = 'SELECT * FROM buy  ORDER BY id DESC';
							mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
								if(!err3){
									console.log(`Orders [ ${req.session.username} ]`);
									res.render('all_orders' , {art: rows , cart: rows2 , buy_info: rows3 , user_session: req.session.username});
								}
								else{
									console.log(err3);
								}
							});

						}
						else{
							console.log(err2);
						}
					});
				}
				else{
					console.log(err);
				}

			});
		}
		else{
			res.redirect('/login');
		}
	});

	//orders..
		
	app.get('/orders' , function(req , res){
		if(req.session.username){
			let query = 'SELECT * FROM art';
			mysqlConnection.query(query , function(err , rows , fields){
				if(!err){
					let query2 = 'SELECT * FROM cart';
					mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
						if(!err2){
							let query3 = 'SELECT * FROM buy WHERE done = "ordered" ORDER BY id DESC';
							mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
								if(!err3){
									console.log(`Orders [ ${req.session.username} ]`);
									res.render('orders' , {art: rows , cart: rows2 , buy_info: rows3 , user_session: req.session.username});
								}
								else{
									console.log(err3);
								}
							});

						}
						else{
							console.log(err2);
						}
					});
				}
				else{
					console.log(err);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});

	//reorder..
	app.get('/reorder/:order_id' , function(req , res){
		if(req.session.username){
			let query = 'UPDATE buy SET done = "ordered" WHERE order_id = ?';
			mysqlConnection.query(query , [req.params.order_id] , function(err , rows , fields){
				if(!err){
					console.log(`Reordered by [ ${req.session.username} ] order id : ${req.params.order_id}..`);
					res.redirect('/orders');
				}
				else{
					console.log(err);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});

	//cancel from all orders..
	app.get('/cancel_from_all_order/:order_id' , function(req , res){
		if(req.session.username){
			let cancel_check = false;
			let query2 = 'SELECT * FROM buy';
			mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
				if(!err2){
					
					//let query = 'DELETE FROM buy WHERE order_id = ?';
					let query = 'UPDATE buy SET done = "cancelled" WHERE order_id = ?';
					mysqlConnection.query(query , [req.params.order_id] , function(err , rows , fields){
						if(!err){
							console.log(`order cancelled [ Order id : ${req.params.order_id}] by [ ${req.session.username} ]`);
							res.redirect('/all_orders');
						}
						else{
							console.log('Not cancelled ..[ERROR]');
							console.log(err);
						}
					});
					
					
				}
				else{
					console.log(err2);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});


	//cancel order..
	app.get('/cancel_order/:order_id' , function(req , res){
		if(req.session.username){
			let cancel_check = false;
			let query2 = 'SELECT * FROM buy';
			mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
				if(!err2){
					
					//let query = 'DELETE FROM buy WHERE order_id = ?';
					let query = 'UPDATE buy SET done = "cancelled" WHERE order_id = ?';
					mysqlConnection.query(query , [req.params.order_id] , function(err , rows , fields){
						if(!err){
							console.log(`order cancelled [ Order id : ${req.params.order_id}] by [ ${req.session.username} ]`);
							res.redirect('/orders');
						}
						else{
							console.log('Not cancelled ..[ERROR]');
							console.log(err);
						}
					});
					
					
				}
				else{
					console.log(err2);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});


	//user page...
	app.get('/user' , function(req , res){
		if (req.session.username){
			let query = 'SELECT * FROM user_info';
			mysqlConnection.query(query , function(err , rows , fields){
				if (!err){
					for(let i = 0 ; i < rows.length ; i++){
						if(rows[i].username == req.session.username){
							update_check = true;
							break;
						}
					}
					let query2 = 'SELECT * FROM cart';
					mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
						if(!err2){
							let query3 = 'SELECT * FROM buy';
							mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
								if(!err3){
									console.log(`user [ ${req.session.username} ]`);
									res.render('user' , {update_check: update_check , user_session: req.session.username , user_data: rows , cart: rows2 , buy_info: rows3});
								}
								else{
									console.log(err3);
								}
							});
							
						}
					});

					
					
				}
				else{
					console.log(err);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});

	app.post('/user' ,  urlencodedParser, function(req , res){
		if (update_check){
			let query = 'UPDATE user_info SET name = ? , mobile = ? , address = ? , city = ? , country = ? WHERE username = ?';
			mysqlConnection.query(query , [req.body.name , req.body.mobile , req.body.address  , req.body.city , req.body.country , req.session.username] , function(err , rows , fields){
				if (!err) {
					res.redirect('/user');
					update_check = false;
				}
				else console.log(err);
			});
		}
		else{
			let query = 'INSERT INTO user_info(username , name , mobile , address , city , country) VALUES(? , ? , ? , ? , ? , ?)';
			mysqlConnection.query(query , [req.session.username , req.body.name , req.body.mobile ,  req.body.address , req.body.city , req.body.country] , function(err , rows , fields){
				if (!err) res.redirect('/user');
				else console.log(err);
			});
		}
	});



	//buy page..
	app.get('/buy/:art_id_string' , function(req , res){
		if(req.session.username){
			let query3 = 'SELECT * FROM art';
			mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
				if(!err3){
					let query = 'SELECT * FROM user_info';
					mysqlConnection.query(query , function(err , rows , fields){
						if(!err){
							let order_id  = '';
							// let add = 0;
							let art_id_string = req.params.art_id_string;
							let art_ids = art_id_string.split(',');
							console.log(art_ids);
							// for(let m = 0 ; m < art_ids.length ; m++){
							// 	add = add + ','+ art_ids[m];
							// }
							order_id = 'orderID' + req.session.username + req.params.art_id_string;
							let success = true;
							let payment = 'cash';
							let delivery_date = new Date();
							// console.log(date_object);
							// let whole_date = date_object;
							// console.log(whole_date);
							// let splitted_date = whole_date.split(' ');
							// let date_number = splitted_date[2] + 3;
							// if(date_number > 30){

							// }
							// let delivery_date_array = splitted_date.split('-');
							// console.log(delivery_date_array);
							
							let query2 = 'INSERT INTO buy(order_id , art_id , username , delivery , payment) VALUES(? , ? , ? , ? , ?)';
							mysqlConnection.query(query2 , [order_id , req.params.art_id_string , req.session.username , delivery_date , payment] , function(err2 , rows2 , fields2){
								if(!err2){
									for(let i = 0 ; i < art_ids.length ; i++){
										let query6 = 'DELETE FROM cart WHERE art_id = ? && username = ?';
										mysqlConnection.query(query6 , [art_ids[i] , req.session.username] , function(err6 , rows6 , fields6){
											if(!err6){
												let query7 = 'UPDATE buy SET done = "ordered" WHERE order_id = ?';
												mysqlConnection.query(query7 , [order_id] , function(err7 , rows7 , fields7){
													if(!err7){
														success = true;
													}
													else{
														console.log(err7);
														success = false;
													}
												});
												
											}
											else{
												console.log(err6);
												
											}
										});
									}
									if(success){
										let query4 = 'SELECT * FROM buy';
										mysqlConnection.query(query4 , function(err4 , rows4 , fields4){
											if(!err4){
												let query5 = 'SELECT * FROM cart';
												mysqlConnection.query(query5 , function(err5 , rows5 , fields){
													if(!err5){
														console.log('success');
														res.redirect('/orders');
														// res.render('buy' , {order_id: order_id , cart: rows5 , user_info: rows  , art: rows3, buy_info: rows4 , user_session: req.session.username});
													}
													else{
														console.log(err5);
													}
												});
											}
											else{
												console.log(err4);
											}
										});
									}
									else{
										console.log('process failed');
									}
								}
								else{
									console.log(err2);
								}
							});
						}
							
					
						else{
							console.log(err);
						}
					});
				}
				else{
					console.log(err3);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});





	// app.get('/buy/:art_id_string' , function(req , res){
	// 	if(req.session.username){
	// 		let query3 = 'SELECT * FROM art';
	// 		mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
	// 			if(!err3){
	// 				let query = 'SELECT * FROM user_info';
	// 				mysqlConnection.query(query , function(err , rows , fields){
	// 					if(!err){
	// 						let order_id  = '';
	// 						let add = 0;
	// 						let art_id_string = req.params.art_id_string;
	// 						let art_ids = art_id_string.split(',');
	// 						console.log(art_ids);
	// 						for(let m = 0 ; m < art_ids.length ; m++){
	// 							add = add + art_ids[m];
	// 						}
	// 						order_id = 'orderID' + req.session.username + add;
	// 						let success = true;
	// 						let payment = 'cash';
	// 						let delivery_date = new Date();
	// 						// console.log(date_object);
	// 						// let whole_date = date_object;
	// 						// console.log(whole_date);
	// 						// let splitted_date = whole_date.split(' ');
	// 						// let date_number = splitted_date[2] + 3;
	// 						// if(date_number > 30){

	// 						// }
	// 						// let delivery_date_array = splitted_date.split('-');
	// 						// console.log(delivery_date_array);
	// 						for(let i = 0 ; i < art_ids.length ; i++){
	// 							let query2 = 'INSERT INTO buy(order_id , art_id , username , delivery , payment) VALUES(? , ? , ? , ? , ?)';
	// 							mysqlConnection.query(query2 , [order_id , art_ids[i] , req.session.username , delivery_date , payment] , function(err2 , rows2 , fields2){
	// 								if(!err2){
	// 									let query6 = 'DELETE FROM cart WHERE art_id = ? && username = ?';
	// 									mysqlConnection.query(query6 , [art_ids[i] , req.session.username] , function(err6 , rows6 , fields6){
	// 										if(!err6){
	// 											success = true;
	// 										}
	// 										else{
	// 											console.log(err6);
	// 											success = false;
	// 										}
	// 									});
	// 								}
	// 								else{
	// 									console.log(err2);
	// 								}
	// 							});
	// 						}
	// 						if(success){
	// 							let query4 = 'SELECT * FROM buy';
	// 							mysqlConnection.query(query4 , function(err4 , rows4 , fields4){
	// 								if(!err4){
	// 									let query5 = 'SELECT * FROM cart';
	// 									mysqlConnection.query(query5 , function(err5 , rows5 , fields){
	// 										if(!err5){
	// 											console.log('success');
	// 											res.render('buy' , {order_id: order_id , cart: rows5 , user_info: rows  , art: rows3, buy_info: rows4 , user_session: req.session.username});
	// 										}
	// 										else{
	// 											console.log(err5);
	// 										}
	// 									});
	// 								}
	// 								else{
	// 									console.log(err4);
	// 								}
	// 							});
	// 						}
	// 						else{
	// 							console.log('process failed');
	// 						}	
	// 					}
	// 					else{
	// 						console.log(err)
	// 					}
	// 				});
	// 			}
	// 			else{
	// 				console.log(err3);
	// 			}
	// 		});
	// 	}
	// 	else{
	// 		res.redirect('/login');
	// 	}
	// });

	//remove from all orders..
	app.get('/remove_from_orders/:order_id' , function(req , res){
		let query = 'DELETE FROM buy WHERE order_id = ?';
		mysqlConnection.query(query , [req.params.order_id] , function(err , rows , fields){
			if(!err){
				console.log('Deleted item from all orders list...');
				//const url = '/art/'+ req.params.art_id;
				res.redirect('/all_orders');
			}
			else{
				console.log(err);
			}
		});
	});
	//remove from cart..
	app.get('/remove_from_cart/:art_id' , function(req , res){
		let query = 'DELETE FROM cart WHERE art_id = ?';
		mysqlConnection.query(query , [req.params.art_id] , function(err , rows , fields){
			if(!err){
				console.log('Deleted item from cart...');
				//const url = '/art/'+ req.params.art_id;
				res.redirect('/cart');
			}
			else{
				console.log(err);
			}
		});
	});

	//delete from cart..
	app.get('/delete/:art_id' , function(req , res){
		let query = 'DELETE FROM cart WHERE art_id = ?';
		mysqlConnection.query(query , [req.params.art_id] , function(err , rows , fields){
			if(!err){
				console.log('Deleted item from cart...');
				const url = '/art/'+ req.params.art_id;
				res.redirect(url);
			}
			else{
				console.log(err);
			}
		});
	});

	//add to cart
	app.get('/add/:art_id' , function(req , res){
		let query = 'INSERT INTO cart(art_id , username) VALUES(? , ?)';
		mysqlConnection.query(query , [req.params.art_id , req.session.username] , function(err , rows , fields){
			if(!err){
				console.log('added to cart...');
				const url = '/art/'+ req.params.art_id;
				res.redirect(url);
			}
			else{
				console.log(err);
			}
		});
	});

	//cart
	app.get('/cart' , function(req , res){
		if(req.session.username){
			let query = 'SELECT * FROM cart';
			mysqlConnection.query(query , function(err , rows , fields){
				if(!err){
					let query2 = 'SELECT * FROM art';
					mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
						if(!err2){
							let query3 = 'SELECT * FROM buy';
							mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
								if(!err3){
								
									res.render('cart' , {art: rows2 , cart: rows , user_session: req.session.username , buy_info: rows3});
								}
								else{
									console.log(err3)
								}
							});
							
						}
						else{
							console.log(err2);
						}
					});
				}
				else{
					console.log(err);
				}

			});
		}
		else{
			res.redirect('/login');
		}
	});

	//show art bigger..
	app.get('/art/:art_id' , function(req , res){
		if(req.session.username){
			let query = 'SELECT * FROM art WHERE id = ?';
			mysqlConnection.query(query , [req.params.art_id] , function(err ,rows , fields){
				if(!err){
					let query2 = 'SELECT * FROM cart';
					mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
						if(!err2){
							let query3 = 'SELECT * FROM buy';
							mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
								if(!err3){
								
									res.render('show_art' , {user_session: req.session.username , art: rows , cart: rows2 , buy_info: rows3});
								}
								else{
									console.log(err3)
								}
							});
						}
						else{
							console.log(err2);
						}
					});
				}
				else{
					console.log(err);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});

	//home
	app.get('/' , function(req , res){
		if(req.session.username){
			
			let query = 'SELECT * FROM art';
			mysqlConnection.query(query , function(err ,rows , fields){
				if(!err){
					let query2 = 'SELECT * FROM cart';
					mysqlConnection.query(query2 , function(err2 , rows2 , fields2){
						if(!err2){
							let query3 = 'SELECT * FROM buy';
							mysqlConnection.query(query3 , function(err3 , rows3 , fields3){
								if(!err3){
									console.log(`homepage [ ${req.session.username} ] `);
									res.render('home' , {user_session: req.session.username , art: rows , cart: rows2 , buy_info: rows3});
								}
								else{
									console.log(err3);
								}
							});
						}
						else{
							console.log(err2);
						}
					});
					
				}
				else{
					console.log(err);
				}
			});
		}
		else{
			res.redirect('/login');
		}
	});

	//login
	app.get('/login' , function(req , res){
		if(!req.session.username){
			
			res.render('login' , {message: message});
		}
		else{
			res.redirect('/');
		}
	});

	app.post('/login' , urlencodedParser , function(req , res){
		let check = false;
		let query = 'SELECT * FROM user';
		mysqlConnection.query(query , function(err , rows , fields){
			if(!err){
				for(let i = 0 ; i < rows.length ; i++){
					if(rows[i].username == req.body.username && rows[i].password == req.body.password){
						req.session.username = req.body.username;
						console.log(`[ ${req.session.username} ] : Logged in...`);
						// res.render('home' , {user_session: req.session.username});
						res.redirect('/');
						check = true;
					}
					
				}
				if(!check){

					message = " incorrect username or password...";
					res.render('login' , {message: message});
					message = " ";
		
				}
			}
		});
	});

	//signup
	app.get('/signup' , function(req , res){
		if(!req.session.username){
			
			res.render('signup' , {message: message});
		}
		else{
			res.redirect('/');
		}
	});

	app.post('/signup' , urlencodedParser , function(req , res){
		
		console.log(req.body);
		if(req.body.password == req.body.confirm_password){
			let query = 'INSERT INTO user(username , password , mobile) VALUES(? , ? , ?)';
			mysqlConnection.query(query , [req.body.username , req.body.password , req.body.mobile] , function(err , rows , fields){
				if(!err){
					req.session.username = req.body.username;
					res.redirect('/');
				}
				else{
					console.log(err);
				}
			});
		}
		else{
			message = "passwords don't match...";
			res.render('signup' , {message: message});
			message = " ";
		}
	});

	//start page..
	app.get('/start' , function(req , res){
		if(!req.session.username){
			res.render('startpage');
		}
		else{
			res.redirect('/');
		}
	});

}