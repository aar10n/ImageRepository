class CreateUploads < ActiveRecord::Migration[6.1]
  def change
    create_table :uploads, id: :uuid do |t|
      t.references :image, null: false, type: :uuid, foreign_key: true
      t.uuid :batch_id
      t.binary :data
      t.string :url
      t.boolean :completed
      t.datetime :expires

      t.timestamps
    end
  end
end
