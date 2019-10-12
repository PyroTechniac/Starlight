#[macro_use]
extern crate neon;

use neon::meta::{BUILD_PROFILE, VERSION};
use neon::prelude::*;

fn version(mut cx: FunctionContext) -> JsResult<JsString> {
    let mut complete_version = String::from(VERSION);
    complete_version.push_str("-");
    complete_version.push_str(BUILD_PROFILE);
    Ok(cx.string(complete_version))
}

register_module!(mut cx, {
    cx.export_function("version", version)?;
    Ok(())
});
