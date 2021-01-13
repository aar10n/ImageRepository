# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_12_23_203412) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "images", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "file_name"
    t.integer "file_size"
    t.string "mime_type"
    t.integer "width"
    t.integer "height"
    t.string "orientation"
    t.string "shortlink"
    t.string "description"
    t.boolean "private"
    t.boolean "published"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "image_id", null: false
    t.string "kind"
    t.string "value"
    t.integer "count"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["image_id"], name: "index_tags_on_image_id"
  end

  create_table "uploads", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "image_id", null: false
    t.uuid "batch_id"
    t.binary "data"
    t.string "url"
    t.boolean "completed"
    t.datetime "expires"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["image_id"], name: "index_uploads_on_image_id"
  end

  add_foreign_key "tags", "images"
  add_foreign_key "uploads", "images"
end
