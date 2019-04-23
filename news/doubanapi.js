//批量读取豆瓣的图书和电影
//by justin 20120316
//http://fejustin.com
//--dbapi.begin--
var $ = jQuery;
var dbapi = {
	appendScript:function(url){
		if ((url)&&(url.length > 0))
			$("<script/>").attr("src",url).attr("charset","utf-8").appendTo($("head")[0]);
	},
	/**
	 * 解析json数据为数组
	 */
	parseJSON:function(json){
		var items=[];
			$.each(json.entry,function(i,item){
				var link = {};
				link.title = item["db:subject"]["title"]["$t"];				
				link.link = item["db:subject"]["link"][1]["@href"];//硬编码
				link.src = item["db:subject"]["link"][2]["@href"];//硬编码
				// 为了拿大图，把封面图中的 spic 替换成 lpic
				// 拿到的封面图地址例子：http://img3.douban.com/spic/s6974202.jpg
				link.src = link.src.replace("spic", "lpic");
				items.push(link);
			});			
		return items;
	},
	render:function(items){
		var html='';		
		$.each(items,function(i,item){
			html+='<a href="'
				+item.link+'" target="_blank"><img src="'
				+item.src+'" alt="'+item.title
				+'" title="'+item.title+'"border="0" /></a>';
		});
		return html;
	},
	/**
	 * todo: bookurl 和 movieurl 可以合并简化
	 */
	bookurl:function(stus,begin,end){
		return this.allurl("book",stus,begin,end);
	},
	allurl:function  (typ,stus,begin,end) {
		if (end ===0) return;
		if(!dbapi[typ + stus +"_SHOW"]){
			dbapi[typ + stus +"_SHOW"] = function (json) {
				var mainplace = $("#" + this.opts.place);
				if (mainplace.length === 0){
					mainplace = $("<div/>").attr("id", this.opts.place).prependTo($("article"));
				}
				if ($("#"+typ+stus).length === 0){
					var title = this.defaults[typ+stus+"title"]?this.defaults[typ+stus+"title"]:
							     ">>>"+typ.toUpperCase() +"-"+stus.toUpperCase()+">>>";
					$("<h2/>").text(title).appendTo(mainplace);
					$("<div/>").attr("id",typ+stus).addClass("douban-list").appendTo(mainplace);
					$("<br/>").appendTo(mainplace);
				}					
				$("#"+typ+stus).append(this.render(this.parseJSON(json)));				
			}
		}
		return this.apiurl(typ,this.opts.user,this.opts.api,stus,begin,end);
	},
	apiurl:function(typ,user,key,stus,begin,end){
		var url = "http://api.douban.com/people/"+user+"/collection?cat="+typ+"&start-index="+
			begin+"&max-results="+end+"&status="+stus+"&alt=xd&callback=dbapi."+typ+stus+"_SHOW";
		if (key.length > 0)
			url += "&apikey="+key;
		return url;
	},
	/**
	 * 将num按50分段生成数组集合
	 * @param  {[type]} num 显示项目的个数
	 * @return {[type]} 按50分段的数组
	 */	
	fixNum:function(num){
	    var len = num;		
		var index = 1;
		var fixnums=[];
		if (50>len> 0){
			fixnums.push({begin:index,end:len})
		}else{
			while (len > 0) {
				fixnums.push({begin:index,end:index+49})
				len -= 50;
				index +=50;
			};	
		}
		return fixnums;
	},
	/**
	 * 根据配置项显示豆瓣的图书和电影
	 * @param  {[Object]} options [可选配置项]
	 */
	show:function(options){
		this.opts = $.extend({}, this.defaults, options);
		var books = [];
		$.each(this.opts.book,function (i,item) {
			books.push({stus:item.stus,indexs:dbapi.fixNum(item.maxnum)});	
		});

		$.each(books,function(i,item){	
			$.each(item.indexs,function(t,idx){
				setTimeout(dbapi.appendScript(dbapi.bookurl(item.stus,idx.begin,idx.end)),300);
			});				
		});
	},
	/**
	 * 可选配置项
	 * @type {Object}
	 * todo:可以进一步把book和movie合并到一起，通过类型区分。
	 */
	defaults:{
		place:"douban",
		user:"",
		api:"",
		book:[{stus:"read",maxnum:500},{stus:"reading",maxnum:20},{stus:"wish",maxnum:100}],
		bookreadingtitle:"在读...",
		bookreadtitle:"读过...",
		bookwishtitle:"想读...",
	}
}
//--dbapi.end--
