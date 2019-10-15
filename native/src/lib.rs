use wasm_bindgen::prelude::*;

// This creates a JS function that returns `8` and is named returnEight
#[wasm_bindgen(js_name = returnEight)]
pub fn return_eight() -> u8 {
    8
}