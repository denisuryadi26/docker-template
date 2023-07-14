'user strict';

const DB = require('./db');
const path = require('path');
const fs = require('fs');

class Helper{

	constructor(app){
		this.db = DB;
	}

	async addSocketId(userId, userSocketId){
		try {
			return await this.db.query(`UPDATE conf_users SET socket_id = ?, online= ? WHERE id = ?`, [userSocketId,'Y',userId]);
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	/*//
	async loginUser(userId, userSocketId){
		return await this.db.query(`UPDATE conf_users SET socket_id = ?, online= ? WHERE id = ?`, [userSocketId,'Y',userId]);
	}*/


	async logoutUser(userSocketId){
		return await this.db.query(`UPDATE conf_users SET socket_id = ?, online= ? WHERE socket_id = ?`, ['','N',userSocketId]);
	}

	getUnprocessOrderList()
	{
		try {
			return Promise.all([
				this.db.query(
					`
					select o.id,
					       o.order_code,
					       tht.code
					from tbl_order o
					         left join tbl_hub_transaction tht on tht.order_id = o.id and tht.deleted_at is null
					where o.deleted_at is null
					  and tht.code is null
					order by o.created_at desc
					`)
			]).then( (response) => {
				return {
					unprocessOrderList : response[0]
				};
			}).catch( (error) => {
				console.warn(error);
				return (null);
			});
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	getChatList(userId){
		try {
			return Promise.all([
				this.db.query(`SELECT 
									cu.id, 
									cu.username, 
									cu.profile_picture, 
									cu.socket_id, 
									cu.online, 
									cg.name as groupname, 
									cu.last_login  as last_login 
								FROM conf_users cu 
								left join conf_group cg on cu.group_id = cg.id 
								WHERE cu.id != ? and cu.deleted_at is null 
								and group_id is not null 
								and hub_id is null 
								and cu.online = 'Y'
								order by online asc,last_login asc, username asc`, [userId])
			]).then( (response) => {
				return {
					chatlist : response[0]
				};
			}).catch( (error) => {
				console.warn(error);
				return (null);
			});
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	getOrderList(){
		try {
			return Promise.all([
				this.db.query(`select o.id,
								       o.order_code,
								       GROUP_CONCAT(ta.name SEPARATOR ', ') as area_name,
								       tht.code
								from tbl_order o
								         left join tbl_hub_transaction tht on tht.order_id = o.id and tht.deleted_at is null
								         left join tbl_hub th on th.id = o.hub_id and th.deleted_at is null
								         left join tbl_hub_area tha on th.id = tha.hub_id and is_save = 1
								         left join tbl_area ta on ta.id = tha.area_id and ta.deleted_at is null
								where o.deleted_at is null
								  and tht.code is null
								group by o.id, o.order_code, tht.code
								order by o.created_at desc` )
				// this.db.query(`SELECT cu.id, cu.username, cu.socket_id, cu.online, cg.name as groupname, cu.last_login  as last_login FROM conf_users cu left join conf_group cg on cu.group_id = cg.id WHERE cu.id != ? and cu.online = 'Y'`, [userId])
			]).then( (response) => {
				return {
					orderList : response[0]
				};
			}).catch( (error) => {
				console.warn(error);
				return (null);
			});
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	async insertMessages(params){
		try {
			return await this.db.query("INSERT INTO tbl_message (`type`, `file_format`, `file_path`, `from_user_id`,`to_user_id`,`message`, `date`, `time`, `ip`) values (?,?,?,?,?,?,?,?,?)", [params.type, params.fileFormat, params.filePath, params.fromUserId, params.toUserId, params.message, params.date, params.time,params.ip]
			);
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	async insertOrder(params){

			// 'id',
   //      'order_code',
   //      'hub_id',
   //      'user_id',
   //      'user_detail_id',
   //      'agent_delivery_id',
   //      'total_price',
   //      'total_coin_use',
   //      'total_payment',
   //      'shipping_price',
   //      'shipping_discount',
   //      'total_shipping',
   //      'purchase_discount',
   //      'coin_cashback',
   //      'coin_purchase',
   //      'brand_discount',
   //      'total_discount',
   //      'voucher_shipping_id',
   //      'voucher_purchase_id',
   //      'voucher_brand_id',
   //      'order_date',
   //      'payment_due_date',
   //      'payment_type',
   //      'status',
   //      'status_payment',
   //      'latitude',
   //      'longitude',
   //      'delivery_address',
   //      'notes',
   //      'is_coin_claimed',
   //      'shipping_cost',
   //      'is_cross',
   //      'order_from',
   //      'tracking_visit_order_id'
		try {
			return await this.db.query("INSERT INTO tbl_order (`id`, `order_code`,`user_detail_id`) values (?,?,?)", 
				[params.id, params.order_code, params.user_detail_id]
			);
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	async getMessages(userId, toUserId){
		try {
			return await this.db.query(
				`SELECT id,from_user_id as fromUserId,to_user_id as toUserId,message,time,date,type,file_format as fileFormat,file_path as filePath FROM tbl_message WHERE
					(from_user_id = ? AND to_user_id = ? )
					OR
					(from_user_id = ? AND to_user_id = ? )	ORDER BY id ASC
				`,
				[userId, toUserId, toUserId, userId]
			);
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	async mkdirSyncRecursive(directory){
		var dir = directory.replace(/\/$/, '').split('/');
        for (var i = 1; i <= dir.length; i++) {
            var segment = path.basename('uploads') + "/" + dir.slice(0, i).join('/');
            !fs.existsSync(segment) ? fs.mkdirSync(segment) : null ;
        }
	}
}
module.exports = new Helper();
