const util = require("util");
const fs = require("fs");
const path = require("path");

const execPromise = util.promisify(require("child_process").exec);
const engine = Vue.prototype.$engine;
const {default: PQueue} = engine.util.requireFunc('p-queue');
const GB = Vue.prototype.$global;
const mkdirp = engine.util.requireFunc("mkdirp");

//---- setup dir and config ----//
var platformName = "arduino-esp32";
var motherPlatform = "esp-idf";

var motherPlatformDir = `${engine.util.platformDir}/${motherPlatform}`;
var platformDir = `${engine.util.platformDir}/${platformName}`;
var platformLibDir = `${platformDir}/lib`;
var toolDir = `${motherPlatformDir}/tools`;
//---- idf platform ----//
const idf = require(`${motherPlatformDir}/compiler`);

const log = msg => {
  console.log(`[arduino-esp32] : ${msg}`);
  GB.$emit("compile-log",`[arduino-esp32] : ${msg}`);
};

const ospath = function(p) {
  if (process.platform == "win32") {
    return p.replace(/\//g, "\\");
  }
  return p;
};

function esptool() {
  if (process.platform == "win32") {
    return `${toolDir}/esptool.exe`;
  } else if (process.platform == "darwin") {
    return `${toolDir}/esptool`;
  }
  return `${toolDir}/esptool.py`;
}

const getName = (file) => path.basename(file).split(".")[0];

var G = {};

const setConfig = (context) => {
  let localContext = JSON.parse(
      fs.readFileSync(`${platformDir}/context.json`, "utf8"));
  G = Object.assign({}, localContext);
  G.board_name = context.board_name;   //require boardname
  G.app_dir = context.app_dir;         //require app_dir
  G.process_dir = context.process_dir; //require working dir
  G.cb = context.cb || function() {
  };

  if (!G.cpp_options) {
    G.cpp_options = [];
  }
  G.cflags = G.cflags.map(f => f.replace(/\{platform\}/g, platformDir));
  G.ldflags = G.ldflags.map(f => f.replace(/\{platform\}/g, platformDir));
  G.ldlibflag = G.ldlibflag.map(f => f.replace(/\{platform\}/g, platformDir));

  G.COMPILER_AR = `${motherPlatformDir}/${G.toolchain_dir}/bin/xtensa-esp32-elf-ar`;
  G.COMPILER_GCC = `${motherPlatformDir}/${G.toolchain_dir}/bin/xtensa-esp32-elf-gcc`;
  G.COMPILER_CPP = `${motherPlatformDir}/${G.toolchain_dir}/bin/xtensa-esp32-elf-g++`;

  G.ELF_FILE = `${G.app_dir}/${G.board_name}.elf`;
  G.BIN_FILE = `${G.app_dir}/${G.board_name}.bin`;
  G.ARCHIVE_FILE = `${G.app_dir}/libmain.a`;

  idf.setConfig(context);
};

//=====================================//

function compile(rawCode, boardName, config, cb) {
  //=====setup======//
  let boardDirectory = `${GB.board.board_info.dir}`;
  let platformDirectory = `${engine.util.platformDir}/${GB.board.board_info.platform}`;
  let boardIncludeDir = `${boardDirectory}/include`;
  let platformIncludeDir = `${platformDirectory}/include`;
  let context = JSON.parse(fs.readFileSync(boardDirectory + "/context.json", "utf8"));

  log(`compiler.compile platformDir = ${platformDirectory}`);

  return new Promise((resolve, reject) => {
    //--- init ---//
    let codegen = null;
    if (fs.existsSync(`${boardDirectory}/codegen.js`)) {
      codegen = require(`${boardDirectory}/codegen.js`);
    } else {
      codegen = engine.util.requireFunc(`${platformDirectory}/codegen`);
    }
    log('>>> Generate Code ...');
    //---- inc folder ----//
    let app_dir = `${boardDirectory}/build/${boardName}`;
    let inc_src = [];
    let inc_switch = [];
    //--- step 1 load template and create full code ---//
    let sourceCode = null;
    let codeContext = null;
    if (config.isSourceCode) {
      sourceCode = rawCode;
      //searching all include to find matched used plugin file
      codeContext = {
        plugins_sources: [],
        plugins_includes_switch: [],
      };
      let pluginInfo = GB.plugin.pluginInfo;
      let incsRex = /#include\s*(?:\<|\")(.*?\.h)(?:\>|\")/gm;
      let m;
      while (m = incsRex.exec(sourceCode)) {
        let incFile = m[1].trim();
        //lookup plugin exist inc file and not added to compiled files.
        let includedPlugin = pluginInfo.categories.find(
          obj=>
            obj.sourceFile.includes(incFile) &&
            !codeContext.plugins_includes_switch.includes(obj.sourceIncludeDir)
        );
        if(includedPlugin){
          log("Include Plugin to compiler => " + includedPlugin.category.name);
          codeContext.plugins_includes_switch.push(includedPlugin.sourceIncludeDir);
          let cppFiles = includedPlugin.sourceFile
            .filter(el=>el.endsWith(".cpp") || el.endsWith(".c"))
            .map(el=>includedPlugin.sourceIncludeDir + "/" +el);
          codeContext.plugins_sources.push(...cppFiles);
        }
      }
    } else {
      let res = codegen.generate(rawCode);
      sourceCode = res.sourceCode;
      codeContext = res.codeContext;
    }
    //----- plugin file src ----//
    inc_src = inc_src.concat(codeContext.plugins_sources);
    inc_switch = inc_switch.concat(codeContext.plugins_includes_switch);
    // filter only unique file name (give priority to plugin first)
    // merge board include file
    inc_src = inc_src.concat(engine.util.walk(boardIncludeDir).filter(
      file =>
        (path.extname(file) === ".cpp" || path.extname(file) === ".c")
        && inc_src.find(el=>el.endsWith(path.basename(file))) == null
    ));
    // merge platform include file
    inc_src = inc_src.concat(engine.util.walk(platformIncludeDir).filter(
      file =>
        (path.extname(file) === ".cpp" || path.extname(file) === ".c")
        && inc_src.find(el=>el.endsWith(path.basename(file))) == null
    ));
    //------ clear build folder and create new one --------//
    if (fs.existsSync(app_dir)) {
      engine.util.rmdirf(app_dir);
    }
    mkdirp.sync(app_dir);
    //-----------------------------------------------------//
    fs.writeFileSync(`${app_dir}/user_app.cpp`, sourceCode, "utf8");
    //--- step 3 load variable and flags ---//
    let cflags = [];
    let ldflags = [];
    let libflags = [];
    if (context.cflags) {
      cflags = context.cflags.map(f => f.replace(/\{board\}/g, boardDirectory));
    }
    if (context.ldflags) {
      ldflags = context.ldflags.map(
        f => f.replace(/\{board\}/g, boardDirectory));
    }
    if (context.libflags) {
      libflags = context.libflags.map(
        f => f.replace(/\{board\}/g, boardDirectory));
    }
    //--- step 4 compile
    let contextBoard = {
      board_name: boardName,
      app_dir: app_dir,
      process_dir: boardDirectory,
      cb,
    };

    inc_src.push(`${app_dir}/user_app.cpp`);
    setConfig(contextBoard);

    engine.util.promiseTimeout(100).then(() => {
      return compileFiles(inc_src, [], cflags, inc_switch);
    }).then(() => {
      return idf.archiveProgram(inc_src);
    }).then(() => {
      return linkObject(ldflags, libflags);
    }).then(() => {
      return idf.createBin();
    }).then(() => {
      resolve();
    }).catch(msg => {
      log("error msg : " + msg);
      reject(msg);
    });
  });
}


//=====================================//

const compileFiles = function(sources, boardCppOptions, boardcflags, plugins_includes_switch,concurrent = 8) {
  log('>>> Compile Files ...');
  const queue = new PQueue({concurrency: concurrent});

  fs.copyFileSync(`${platformDir}/main.cpp`, `${G.app_dir}/main.cpp`);
  sources.push(`${G.app_dir}/main.cpp`);
  return new Promise(async (resolve, reject) => {
    let cflags = `${G.cflags.join(" ")} ${boardcflags.join(" ")}`;
    let cppOptions = G.cpp_options.join(" ") + boardCppOptions.join(" ");
    let inc_switch = plugins_includes_switch.map(obj => `-I"${obj}"`).join(" ");
    let exec = async function(file,cmd){
      try {
        log("Compiling => " + file);
        const {stdout, stderr} = await execPromise(ospath(cmd), {cwd: G.process_dir});
        if (!stderr) {
          log(`Compiled ... ${file} OK.`);
          G.cb(`compiling... ${path.basename(file)} ok.`);
        } else {
          log(`Compiled... ${file} OK. (with warnings)`);
          G.cb({
                 file: path.basename(file),
                 error: null,
               });
        }
      } catch (e) {
        log("Compile Error : " + e);
        console.error(`[arduino-esp32].compiler.js catch something`, e.error);
        console.error(`[arduino-esp32].compiler.js >>> `, e);
        let _e = {
          file: file,
          error: e,
        };
        reject(_e);
      }
    };
    for(let i in sources){
      let file = sources[i];
      let filename = getName(file);
      let fn_obj = `${G.app_dir}/${filename}.o`;
      let cmd = `"${G.COMPILER_CPP}" ${cppOptions} ${cflags} ${inc_switch} -c "${file}" -o "${fn_obj}"`;
      //let cmd = file.endsWith(".c")? cmd_c : cmd_cpp;
      queue.add(async ()=>{ await exec(file,cmd); });
    }
    await queue.onIdle();
    resolve();
  });
};

const linkObject = function(ldflags, extarnal_libflags) {
  log(`>>> Linking... ${G.ELF_FILE}`);
  G.cb(`linking... ${G.ELF_FILE}`);
  let flags = G.ldflags.concat(ldflags);
  let libflags = (extarnal_libflags) ? G.ldlibflag.concat(extarnal_libflags).
  join(" ") : G.ldlibflag.join(" ");
  flags = G.ldflags.join(" ") + " " + ldflags.join(" ");
  let cmd = `"${G.COMPILER_GCC}" ${flags} -Wl,--start-group ${libflags} -L"${G.app_dir}" -lmain -lgcov -Wl,--end-group -Wl,-EL -o "${G.ELF_FILE}"`;
  return execPromise(ospath(cmd), {cwd: G.process_dir});
};

function flash(port, baudrate, stdio, partition, flash_mode = "dio",
               flash_freq = "40m") {
  baudrate = baudrate || 115200;
  partition = partition || {
    "0xe000": `${motherPlatformDir}/tools/partitions/boot_app0.bin`,
    "0x1000": `${platformDir}/sdk/bin/bootloader_dio_40m.bin`,
    "0x8000": `${motherPlatformDir}/tools/partitions/default.bin`,
    "0x10000": `${G.app_dir}/${G.board_name}.bin`,
  };
  let formatStringPart = Object.keys(partition).
  map(p => `${p} "%s"`).
  join(" ");
  let formatValue = Object.values(partition);
  stdio = stdio || "inherit";
  var flash_cmd = util.format(
    `"${esptool()}" --chip esp32 %s --before "default_reset" --after "hard_reset" write_flash -z --flash_mode "${flash_mode}" --flash_freq "${flash_freq}" --flash_size detect ${formatStringPart}`,
    `--port "${port}" --baud ${baudrate}`,
    ...formatValue,
  );
  log(`Flashing ... ${G.app_dir}/${G.board_name}.bin`);
  return execPromise(ospath(flash_cmd), {
    cwd: G.process_dir,
    stdio,
  });
}
//-------- heritance somefunction from esp-idf ----------//

let exp = {};
Object.assign(exp, idf);
Object.assign(exp,
              {
                compile,
                setConfig,
                linkObject,
                compileFiles,
                flash,
              },
);

module.exports = exp;
