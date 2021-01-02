class CreateImages < ActiveRecord::Migration[6.1]
  def change
    create_table :images, id: :uuid do |t|
      t.string :file_name
      t.integer :file_size
      t.string :mime_type
      t.string :title
      t.string :description
      t.boolean :private
      t.boolean :published
      t.string :shortlink

      t.timestamps
    end
  end
end
