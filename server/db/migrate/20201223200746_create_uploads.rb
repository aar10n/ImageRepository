class CreateUploads < ActiveRecord::Migration[6.1]
  def change
    create_table :uploads, id: :uuid do |t|
      t.uuid :batch_id
      t.uuid :image_id
      t.string :url
      t.boolean :completed
      t.datetime :expires

      t.timestamps
    end
  end
end
