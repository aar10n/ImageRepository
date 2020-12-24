class CreateTags < ActiveRecord::Migration[6.1]
  def change
    create_table :tags, id: :uuid do |t|
      t.references :image, null: false, type: :uuid, foreign_key: true
      t.string :type
      t.string :value

      t.timestamps
    end

    # add_index :tags, :image_id, type: :uuid
  end
end
