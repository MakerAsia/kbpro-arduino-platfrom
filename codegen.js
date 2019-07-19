const fs = require('fs');
const path = require('path');
const log = require('./log');


//---- setup dir ----//
const engine = Vue.prototype.$engine;
const G = Vue.prototype.$global;

//-------------------//
const findString = function(regexS,rawCode,index = 1)
{
    let res = [];
    let m;
    while ((m = regexS.exec(rawCode)) !== null) {
        if (m.index === regexS.lastIndex) {
            regexS.lastIndex++;
        }
        if(m){
            let code = m[index];
            if(!res.includes(code)){
                res.push(code);
            }
        }
    }
    return res;
};
const resolveCode = function(finds,code,res)
{
    if(!res){
        res = {};
    }
    for(let ind = 0;ind < finds.length;ind ++){
      let node = finds[ind];
      if(!code.includes(node)){
        continue;
      }
      let startPos = code.indexOf(node) + node.length;
      let endPos = code.indexOf("#END",startPos) + 4;
      let subCode = code.substring(startPos,endPos);
      if(new RegExp(finds.join("|")).test(subCode)){ //contain sub
        let r = resolveCode(finds,subCode,res);
        res = r.res;
        code = r.code;
        ind--;
        continue; //restart again
      }else{
        if(!res[node]){
          res[node] = [];
        }
        let subNode = code.substring(startPos,endPos - 4).trim();
        if(!res[node].includes(subNode)){
          res[node] = res[node].concat(subNode);
        }
        code = code.substring(0,startPos-node.length) + code.substring(endPos);
        if(code.includes(node)){
          ind--; //start again
        }
      }
    }
    return {res : res, code : code};
};
module.exports = {
    createCodeContext : function(rawCode,config,plugins)
    {
        let source_code = rawCode;
        let finds = ["#EXTINC","#VARIABLE","#FUNCTION","#LOOP_EXT_CODE","#SETUP","#BLOCKSETUP"];
        let preinit = {
          "#EXTINC" : [],"#VARIABLE" : [],"#FUNCTION" : [],"#LOOP_EXT_CODE" : [],"#SETUP" : [],"#BLOCKSETUP" : []
        };
        let pluginInfo = G.plugin.pluginInfo;
        let plugins_includes_switch = [];
        let plugins_sources = [];
        let res = resolveCode(finds,source_code,preinit);
        source_code = res.code;
        let incFiles = res.res["#EXTINC"];
        for(let ix in incFiles){
          let incFileRes = /#include\s*(?:\<|\")(.*?\.h)(?:\>|\")/gm.exec(incFiles[ix]);
          if(incFileRes){
            let incFile = incFileRes[1].trim();
            //lookup plugin
            let includedPlugin = pluginInfo.categories.filter(obj=> obj.sourceFile.includes(incFile));
            if(includedPlugin.length > 0){
              plugins_includes_switch.push(includedPlugin[0].directory + "/src");
              let targetCppFile = includedPlugin[0].directory + "/src/" + incFile.replace(".h",".cpp");
              plugins_sources.push(targetCppFile);
            }
          }
        }
        let replaceRegex2 = /^\s*[\r\n]/gm;
        source_code = source_code.replace(replaceRegex2,"");
        return {
          EXTINC : incFiles.join('\n'),
          FUNCTION : res.res["#FUNCTION"].join('\n'),
          VARIABLE : res.res["#VARIABLE"].join('\n'),
          SETUP_CODE : res.res["#SETUP"].join('\n'),
          BLOCKSETUP : res.res["#BLOCKSETUP"].join('\n'),
          LOOP_CODE : source_code,
          LOOP_EXT_CODE : res.res["#LOOP_EXT_CODE"].join('\n'),
          plugins_includes_switch : plugins_includes_switch,
          plugins_sources : plugins_sources,
        }
        //---- custom include ----//
        /*let extInc = /#EXTINC(.*?)#END/gm;
        let replaceRegex = /#EXTINC.*?#END/gm;
        let plugins_includes_switch = [];
        let plugins_sources = [];
        let incFiles = findString(extInc,source_code);
        for(let ix in incFiles){
            let incFileRes = /#include\s*(?:\<|\")(.*?\.h)(?:\>|\")/gm.exec(incFiles[ix]);
            if(incFileRes){
                let incFile = incFileRes[1].trim();
                //lookup plugin
                let includedPlugin = pluginInfo.categories.filter(obj=> obj.sourceFile.includes(incFile));
                if(includedPlugin.length > 0){
                    plugins_includes_switch.push(includedPlugin[0].directory + "/src");
                    let targetCppFile = includedPlugin[0].directory + "/src/" + incFile.replace(".h",".cpp");
                    plugins_sources.push(targetCppFile);
                }
            }
        }
        source_code = source_code.replace(replaceRegex,"");
        //---- variable -----//
        let varRegex = /#VARIABLE(.*?)#END/gms;
        let varReplaceRegex = /#VARIABLE.*?#END/gms;
        let variables = findString(varRegex,source_code);
        source_code = source_code.replace(varReplaceRegex,"");
        //---- function -----//
        let functionsRegex = /#FUNCTION(.*?)#END/gms;
        let functionReplaceRegex = /#FUNCTION.*?#END/gms;
        let functions = findString(functionsRegex,source_code);
        source_code = source_code.replace(functionReplaceRegex,"");
        //---- find loop extension code ----//
        let loopExtRegex = /#LOOP_EXT_CODE(.*?)#END/gms;
        let loopExtRegex1 = /#LOOP_EXT_CODE.*?#END/gms;
        let loop_ext_code = findString(loopExtRegex,source_code);
        source_code = source_code.replace(loopExtRegex1,"");
        //---- find setup code ----//
        let setupRegex = /#SETUP(.*?)#END/gms;
        let replaceRegex1 = /#SETUP.*?#END/gms;
        let setup_code = findString(setupRegex,source_code);
        source_code = source_code.replace(replaceRegex1,"");
        //---- find user block setup code ----//
        let blocksetupRegex = /#BLOCKSETUP(.*?)#END/gms;
        let blockreplaceRegex1 = /#BLOCKSETUP.*?#END/gms;
        let blocksetup_code = findString(blocksetupRegex,source_code);
        source_code = source_code.replace(blockreplaceRegex1,"");

        //---- clean empty line ----//
        let replaceRegex2 = /^\s*[\r\n]/gm;
        source_code = source_code.replace(replaceRegex2,"");

        //---- plugin ----//
        /*let regexPlugin = /Plugin\.([_0-9A-Za-z]+)\((.*?)\).([_0-9A-Za-z]+).\((.*?)\)/gm;
        let pluginString = findString(regexPlugin,source_code);
        for(let p in pluginString){
            let pline = pluginString[p];
            let clasName = pline[1];
            let classConstructor = pline[2];
            let functionName = pline[3];
            let
        }*/
        //----- list include cpp file------//

        /*return {
            EXTINC : incFiles.join('\n'),
            FUNCTION : functions.join('\n'),
            VARIABLE : variables.join('\n'),
            SETUP_CODE : setup_code.join('\n'),
            BLOCKSETUP : blocksetup_code,
            LOOP_CODE : source_code,
            LOOP_EXT_CODE : loop_ext_code,
            plugins_includes_switch : plugins_includes_switch,
			      plugins_sources : plugins_sources,
        }*/
    },
	generate : function(rawCode){
        let platformDir = `${engine.util.platformDir}/${G.board.board_info.platform}`;
        let boardDirectory = `${engine.util.boardDir}/${G.board.board}`;
        let template = null;
        if(fs.existsSync(`${boardDirectory}/template.c`)){
            template = fs.readFileSync(`${boardDirectory}/template.c`,'utf8');
        }else{
            template = fs.readFileSync(`${platformDir}/template.c`,'utf8');
        }
        let codeContext = this.createCodeContext(rawCode,null,null);
        const entries = Object.entries(codeContext);
        const result = entries.reduce( (output, entry) => {
            const [key, value] = entry;
            const regex = new RegExp( `\\$\{${key}\}`, 'g');
            return output.replace( regex, value );
        }, template );
        //let result = template;
        //let codeContext = {};
        return {sourceCode : result, codeContext : codeContext};
    }
};