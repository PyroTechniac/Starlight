#[macro_use]
extern crate neon;

use neon::meta::{BUILD_PROFILE, VERSION};
use neon::prelude::*;

fn version(mut cx: FunctionContext) -> JsResult<JsString> {
    let complete_version = String::from(VERSION) + "-" + BUILD_PROFILE;
    Ok(cx.string(complete_version))
}

register_module!(mut cx, {
    cx.export_function("version", version)?;
    Ok(())
});
