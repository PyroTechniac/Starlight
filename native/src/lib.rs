#[macro_use]
extern crate neon;

use neon::prelude::*;
use neon::meta::{VERSION, BUILD_PROFILE};

fn version(mut cx: FunctionContext) -> JsResult<JsString> {
    let mut complete_version = VERSION.to_owned();
    complete_version.push_str("-");
    complete_version.push_str(BUILD_PROFILE);
    Ok(cx.string(complete_version))
}

register_module!(mut cx, {
    cx.export_function("version", version)
});